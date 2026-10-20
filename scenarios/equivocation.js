const Node = require("../node");

const {
    makeEquivocator
} = require("../attacks");

const EquivocationDetector =
    require("../equivocation_detector");

const nodeD = new Node("D");

const detector = new EquivocationDetector();

makeEquivocator(nodeD, {
    A: 100,
    B: 50,
    C: 75
});

const round = 1;

const messages = [
    nodeD.voteForPeer("A"),
    nodeD.voteForPeer("B"),
    nodeD.voteForPeer("C")
];

console.log("\nEquivocation Test");

for (const message of messages) {
    console.log("\nMessage:");
    console.log(message);

    detector.recordMessage(message, round);
}

console.log("\nEvidence Log:");
console.table(detector.getEvidenceLog());
