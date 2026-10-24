package app.haven.mobile

import android.app.Application
import androidx.compose.runtime.*
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class HavenViewModel(application: Application) : AndroidViewModel(application) {
    private val store = SecureStore(application)
    var enrolled by mutableStateOf(store.load()); private set
    var syncEnabled by mutableStateOf(store.syncEnabled()); private set
    var lastSync by mutableLongStateOf(store.lastSync()); private set
    var busy by mutableStateOf(false); private set
    var message by mutableStateOf(store.error()); private set
    fun refresh() { enrolled = store.load(); syncEnabled = store.syncEnabled(); lastSync = store.lastSync(); message = store.error() }
    fun pair(server: String, code: String) = run {
        val value = withContext(Dispatchers.IO) { HavenApi.pair(server, code) }
        store.save(value); enrolled = value; syncEnabled = false; lastSync = store.lastSync(); message = "Paired. Automatic status sync is off until you enable it."
    }
    fun toggleSync(enabled: Boolean) {
        store.setSync(enabled); syncEnabled = enabled
        if (enabled) HeartbeatWorker.schedule(getApplication()) else HeartbeatWorker.cancel(getApplication())
    }
    fun sync() = run {
        val value = enrolled ?: return@run
        withContext(Dispatchers.IO) { HavenApi.sync(value) }
        store.success(); lastSync = store.lastSync(); message = "Status updated successfully."
    }
    fun disconnect() = run {
        val value = enrolled ?: return@run
        withContext(Dispatchers.IO) { HavenApi.disconnect(value) }
        HeartbeatWorker.cancel(getApplication()); store.clear(); enrolled = null; syncEnabled = false; lastSync = 0; message = "Disconnected. Device data was deleted from the dashboard."
    }
    private fun run(action: suspend () -> Unit) {
        if (busy) return
        viewModelScope.launch {
            busy = true; message = null
            try { action() } catch (e: Exception) {
                if (e is ApiFailure && e.status == 401 && enrolled != null) { HeartbeatWorker.cancel(getApplication()); store.clear(); enrolled = null; syncEnabled = false }
                message = e.message ?: "Connection failed. Please try again."
            } finally { busy = false }
        }
    }
}
