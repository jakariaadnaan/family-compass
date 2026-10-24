package app.haven.mobile

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class ApiFailure(val status: Int, message: String) : Exception(message)
object HavenApi {
    private fun request(server: String, path: String, token: String? = null, body: JSONObject = JSONObject()): JSONObject {
        val connection = URL(Rules.endpoint(server) + "/api/public/device/" + path).openConnection() as HttpURLConnection
        connection.instanceFollowRedirects = false
        connection.requestMethod = "POST"
        connection.connectTimeout = 15000
        connection.readTimeout = 15000
        connection.doOutput = true
        connection.setRequestProperty("Content-Type", "application/json")
        if (token != null) connection.setRequestProperty("Authorization", "Bearer $token")
        try {
            connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
            val status = connection.responseCode
            if (status !in 200..299) {
                val message = when (status) { 401 -> if (path == "enroll") "Code expired, already used, or incorrect. Create a new code." else "Pairing was removed or expired. Pair this phone again."; 429 -> "Too many attempts. Please try again later."; else -> "Dashboard unavailable. Check its public HTTPS address and try again." }
                throw ApiFailure(status, message)
            }
            return connection.inputStream.bufferedReader().use { JSONObject(it.readText()) }
        } finally { connection.disconnect() }
    }
    fun pair(server: String, code: String): Enrollment {
        val address = Rules.endpoint(server)
        require(Rules.validCode(code)) { "Enter the eight-character pairing code." }
        val result = request(address, "enroll", body = JSONObject().put("code", code))
        return Enrollment(address, result.getString("device_id"), result.getString("device_name"), result.getString("token"), result.getString("expires_at"))
    }
    fun sync(value: Enrollment) { request(value.server, "status", value.token) }
    fun disconnect(value: Enrollment) { request(value.server, "disconnect", value.token) }
}
