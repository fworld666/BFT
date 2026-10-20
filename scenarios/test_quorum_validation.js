const QuorumEngine = require("../quorum");

class UnsafeQuorum extends QuorumEngine {
    size() {
        return 2;
    }
}

try {
    new UnsafeQuorum(4);
    console.log("ERROR: Unsafe quorum was accepted");
    process.exitCode = 1;
} catch (error) {
    console.log("Configuration rejected:", error.message);
}
