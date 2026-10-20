const Network = require("./network");
const QuorumEngine = require("./quorum");

class Simulator {
    constructor(
        nodes,
        customQuorumEngine = null,
        approvedValidators = nodes.map(node => node.id)
    ) {
        this.nodes = nodes;
        this.network = new Network();
        this.approvedValidators = new Set(approvedValidators);

        // Track validators whose identities or keys have been revoked.
        this.revokedValidators = new Set();

        // Store commit certificates as an audit trail.
        this.commitCertificates = [];

        this.quorum =
            customQuorumEngine ||
            new QuorumEngine(this.approvedValidators.size);
    }

    // Revoke an approved validator.
    revoke(nodeId) {
        if (!this.approvedValidators.has(nodeId)) {
            console.log(
                `Cannot revoke unknown validator ${nodeId}`
            );
            return false;
        }

        this.revokedValidators.add(nodeId);
        console.log(`REVOKED: Validator ${nodeId}`);
        return true;
    }

    // Run a consensus round.
    runConsensus(value) {
        console.log("\n====================");
        console.log(`Proposal: ${value}`);
        console.log("====================");

        const votes = [];
        const seenValidators = new Set();

        /*
         * Accept votes only from approved, non-revoked validators.
         * Each validator ID can contribute at most one vote.
         */
        for (const node of this.nodes) {
            const vote = node.vote(value);

            if (this.revokedValidators.has(vote.nodeId)) {
                console.log(
                    `REJECTED: Revoked validator ${vote.nodeId}`
                );
                continue;
            }

            if (!this.approvedValidators.has(vote.nodeId)) {
                console.log(
                    `REJECTED: Unapproved validator ${vote.nodeId}`
                );
                continue;
            }

            if (seenValidators.has(vote.nodeId)) {
                console.log(
                    `REJECTED: Duplicate vote from validator ${vote.nodeId}`
                );
                continue;
            }

            seenValidators.add(vote.nodeId);
            votes.push(vote);
            console.log(`${vote.nodeId} voted ${vote.value}`);
        }

        // Count accepted votes for each proposed value.
        const tally = {};

        for (const vote of votes) {
            tally[vote.value] =
                (tally[vote.value] || 0) + 1;
        }

        console.log("\nVote Tally");
        console.table(tally);

        console.log(
            `Required Quorum = ${this.quorum.size()}`
        );

        // Identify values that have reached the quorum.
        const winners = [];

        for (const candidate in tally) {
            const voteCount = tally[candidate];

            if (this.quorum.reached(voteCount)) {
                winners.push({
                    value: candidate,
                    votes: voteCount
                });
            }
        }

        let certificate = null;

        if (winners.length === 0) {
            console.log("\nNO CONSENSUS");
        } else if (winners.length === 1) {
            const committedValue = winners[0].value;

            // Keep only accepted votes supporting the committed value.
            const supportingVotes = votes.filter(
                vote => String(vote.value) === committedValue
            );

            // Build a certificate from the supporting vote evidence.
            certificate = {
                value: committedValue,
                signatures: supportingVotes.map(vote => ({
                    nodeId: vote.nodeId,
                    signature: vote.signature
                }))
            };

            // Save the certificate for later auditing.
            this.commitCertificates.push(certificate);

            console.log(`\nCOMMITTED: ${committedValue}`);

            console.log("\nCOMMIT CERTIFICATE");
            console.log(`Value = ${certificate.value}`);
            console.log("Signed by:");

            for (const evidence of certificate.signatures) {
                console.log(evidence.nodeId);
            }
        } else {
            console.log("\nSAFETY VIOLATION!");
            console.log("Multiple values reached quorum:");
            console.table(winners);
        }

        return {
            proposal: value,
            votes,
            tally,
            winners,
            certificate
        };
    }
}

module.exports = Simulator;