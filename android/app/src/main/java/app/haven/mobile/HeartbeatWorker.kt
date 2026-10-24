package app.haven.mobile

import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit

class HeartbeatWorker(context: Context, parameters: WorkerParameters) : CoroutineWorker(context, parameters) {
    override suspend fun doWork(): Result {
        val store = SecureStore(applicationContext)
        val enrolled = store.load() ?: return Result.success()
        if (!store.syncEnabled()) return Result.success()
        return try { kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) { HavenApi.sync(enrolled) }; store.success(); Result.success() }
        catch (e: Exception) {
            store.failure(e.message ?: "Sync failed")
            if (e is ApiFailure && e.status == 401) { store.clear(); Result.failure() } else Result.retry()
        }
    }
    companion object {
        fun schedule(context: Context) {
            val work = PeriodicWorkRequestBuilder<HeartbeatWorker>(Rules.HEARTBEAT_MINUTES, TimeUnit.MINUTES).setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS).build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork("haven_status", ExistingPeriodicWorkPolicy.UPDATE, work)
        }
        fun cancel(context: Context) { WorkManager.getInstance(context).cancelUniqueWork("haven_status") }
    }
}
