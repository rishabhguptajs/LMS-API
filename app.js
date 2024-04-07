import express from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import courseRoutes from "./routes/courseRoutes.js"
import fs from "fs"
import morgan from "morgan"

dotenv.config()

const app = express()
const accessLog = fs.createWriteStream("./access.log", { flags: "a" })

app.use(morgan("combined", { stream:accessLog }))
app.use(express.json())

app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/auth", authRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
