class EquivocationDetector {
    constructor() {
        this.evidenceLog = [];
    }

    recordMessage(message, round) {
        const evidence = {
            nodeId: message.nodeId,
            value: message.value,
            recipient: message.recipient,
            round
        };

        this.evidenceLog.push(evidence);

        const sameRoundMessages = this.evidenceLog.filter(
            entry =>
                entry.nodeId === evidence.nodeId &&
                entry.round === evidence.round
        );

        const conflictingMessages = sameRoundMessages.some(
            entry => entry.value !== evidence.value
        );

        if (conflictingMessages) {
            console.log(
                `EQUIVOCATION DETECTED: Node ${evidence.nodeId} sent conflicting values in round ${round}.`
            );

            return {
                detected: true,
                nodeId: evidence.nodeId,
                round,
                evidence: sameRoundMessages
            };
        }

        return {
            detected: false
        };
    }

    getEvidenceLog() {
        return this.evidenceLog;
    }
}

module.exports = EquivocationDetector;
