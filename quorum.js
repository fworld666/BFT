
class QuorumEngine {
    constructor(totalNodes) {
        if (!Number.isInteger(totalNodes) || totalNodes < 1) {
            throw new Error("Invalid total node count");
        }

        this.totalNodes = totalNodes;
        this.validateQuorum();
    }

    size() {
        return Math.floor((2 * this.totalNodes) / 3) + 1;
    }

    validateQuorum() {
        const minimum =
            Math.floor((2 * this.totalNodes) / 3) + 1;

        const quorumSize = this.size();

        if (
            quorumSize < minimum ||
            quorumSize > this.totalNodes
        ) {
            throw new Error("Unsafe quorum size");
        }
    }

    reached(voteCount) {
        return voteCount >= this.size();
    }
}

module.exports = QuorumEngine;
