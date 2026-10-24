package app.haven.mobile

import java.net.URI

object Rules {
    const val HEARTBEAT_MINUTES = 15L
    fun validCode(value: String) = Regex("^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$").matches(value)
    fun endpoint(value: String): String {
        val uri = URI(value.trim())
        require(uri.scheme == "https" && !uri.host.isNullOrBlank() && uri.userInfo == null && uri.query == null && uri.fragment == null && (uri.path.isNullOrEmpty() || uri.path == "/")) { "Enter the HTTPS address of your Haven dashboard, without a page path." }
        return value.trim().trimEnd('/')
    }
}
