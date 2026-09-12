const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://otdr-tccs.com",
      "https://www.otdr-tccs.com",
    ],
  }),
);

app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/", (req, res) => {
  res.send("OTDR-TCCS API is running");
});

app.post("/api/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, training, message } = req.body;

    if (!firstName || !lastName || !email || !training) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    await transporter.sendMail({
      from: `"OTDR-TCCS Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Training Inquiry - ${training}`,
      html: `
        <h2>New Training Inquiry</h2>

        <p><strong>Name:</strong> ${firstName} ${lastName}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>

        <p><strong>Training Interest:</strong> ${training}</p>

        <p><strong>Message:</strong></p>

        <p>${message || "No additional message."}</p>
      `,
    });

    res.json({
      success: true,
      message: "Inquiry sent successfully.",
    });
  } catch (error) {
    console.error("Email error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send inquiry.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`OTDR-TCCS API running on port ${PORT}`);
});
