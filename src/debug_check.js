const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("Checking Environment Variables...");
console.log("MONGO_URI value:", process.env.MONGO_URI ? "Has Value" : "MISSING");
console.log("JWT_SECRET value:", process.env.JWT_SECRET ? "Has Value" : "MISSING");

const jwt = require('jsonwebtoken');
try {
    const token = jwt.sign({ id: 'test' }, process.env.JWT_SECRET || ""); // passing empty string to force error if missing but avoiding standard param error if I want to check specific behavior, but actually I want to check if it matches the server logic.
    // The server does: jwt.sign(..., process.env.JWT_SECRET, ...)
    // If process.env.JWT_SECRET is undefined, it passes undefined.

    // Let's reproduce exactly:
    const t = jwt.sign({ id: 'test' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log("JWT Sign Test: Success");
} catch (e) {
    console.log("JWT Sign Test: FAILED - " + e.message);
}
