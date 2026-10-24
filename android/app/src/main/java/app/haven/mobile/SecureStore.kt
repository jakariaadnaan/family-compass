package app.haven.mobile

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

data class Enrollment(val server: String, val id: String, val name: String, val token: String, val expires: String)
class SecureStore(context: Context) {
    private val prefs = context.getSharedPreferences("haven_private", Context.MODE_PRIVATE)
    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val existing = store.getKey("haven_token", null) as? SecretKey
        if (existing != null) return existing
        return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply {
            init(KeyGenParameterSpec.Builder("haven_token", KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build())
        }.generateKey()
    }
    fun save(value: Enrollment) {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding").apply { init(Cipher.ENCRYPT_MODE, key()) }
        val encrypted = Base64.encodeToString(cipher.doFinal(value.token.toByteArray(Charsets.UTF_8)), Base64.NO_WRAP)
        prefs.edit().putString("token", encrypted).putString("iv", Base64.encodeToString(cipher.iv, Base64.NO_WRAP)).putString("server", value.server).putString("id", value.id).putString("name", value.name).putString("expires", value.expires).putBoolean("sync", false).putLong("last_sync", System.currentTimeMillis()).remove("error").apply()
    }
    fun load(): Enrollment? {
        val encrypted = prefs.getString("token", null) ?: return null
        return try {
            val iv = Base64.decode(prefs.getString("iv", ""), Base64.NO_WRAP)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding").apply { init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, iv)) }
            val token = String(cipher.doFinal(Base64.decode(encrypted, Base64.NO_WRAP)), Charsets.UTF_8)
            Enrollment(prefs.getString("server", "") ?: "", prefs.getString("id", "") ?: "", prefs.getString("name", "Haven phone") ?: "Haven phone", token, prefs.getString("expires", "") ?: "")
        } catch (_: Exception) { clear(); null }
    }
    fun syncEnabled() = prefs.getBoolean("sync", false)
    fun setSync(enabled: Boolean) { prefs.edit().putBoolean("sync", enabled).apply() }
    fun lastSync() = prefs.getLong("last_sync", 0)
    fun error() = prefs.getString("error", null)
    fun success() { prefs.edit().putLong("last_sync", System.currentTimeMillis()).remove("error").apply() }
    fun failure(message: String) { prefs.edit().putString("error", message).apply() }
    fun clear() { prefs.edit().clear().apply() }
}
