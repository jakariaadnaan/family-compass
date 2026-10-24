package app.haven.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import java.text.DateFormat
import java.util.Date

private val Light = lightColorScheme(primary = Color(0xFF075E59), onPrimary = Color.White, secondary = Color(0xFF865C20), secondaryContainer = Color(0xFFFFE5B7), background = Color(0xFFF5F8F8), surface = Color.White, surfaceVariant = Color(0xFFE7F0EF), onSurface = Color(0xFF12332F))
private val Dark = darkColorScheme(primary = Color(0xFF82D5C9), secondary = Color(0xFFFFC46B), background = Color(0xFF0D211F), surface = Color(0xFF152C29), surfaceVariant = Color(0xFF23443F), onSurface = Color(0xFFE4F3F0))
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); setContent { MaterialTheme(colorScheme = if (isSystemInDarkTheme()) Dark else Light) { HavenApp() } } }
}
@OptIn(ExperimentalMaterial3Api::class)
@Composable fun HavenApp(vm: HavenViewModel = viewModel()) {
    var tab by remember { mutableIntStateOf(0) }
    var confirm by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { vm.refresh() }
    val tabs = listOf("Home" to Icons.Outlined.Home, "Sharing" to Icons.Outlined.Tune, "Privacy" to Icons.Outlined.Shield)
    Scaffold(containerColor = MaterialTheme.colorScheme.background, topBar = { TopAppBar(title = { Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.VerifiedUser, null, tint = MaterialTheme.colorScheme.primary); Spacer(Modifier.width(10.dp)); Text("Haven", fontWeight = FontWeight.Bold) } }, actions = { Text("YOUR PHONE", style = MaterialTheme.typography.labelSmall, modifier = Modifier.padding(16.dp), color = MaterialTheme.colorScheme.primary) }) }, bottomBar = { NavigationBar { tabs.forEachIndexed { index, item -> NavigationBarItem(selected = tab == index, onClick = { tab = index }, icon = { Icon(item.second, item.first) }, label = { Text(item.first) }) } } }) { padding ->
        Column(Modifier.padding(padding).fillMaxSize().verticalScroll(rememberScrollState()).padding(24.dp), verticalArrangement = Arrangement.spacedBy(22.dp)) {
            if (vm.busy) LinearProgressIndicator(Modifier.fillMaxWidth())
            if (tab == 0) {
                if (vm.enrolled == null) Pairing(vm) else {
                    val device = vm.enrolled
                    Text("Connected, on your terms.", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.SemiBold)
                    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer), modifier = Modifier.fillMaxWidth()) { Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) { Icon(Icons.Outlined.PhoneAndroid, null, Modifier.size(42.dp)); Text(device?.name ?: "My phone", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold); Text("Paired to your private dashboard", style = MaterialTheme.typography.bodyMedium); Text("Credential expires: ${device?.expires?.take(10) ?: "—"}", style = MaterialTheme.typography.labelSmall) } }
                    StatusRow(Icons.Outlined.CloudDone, "Last successful sync", if (vm.lastSync == 0L) "Not synced" else DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT).format(Date(vm.lastSync)))
                    Button(onClick = { vm.sync() }, enabled = !vm.busy, modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)) { Icon(Icons.Outlined.Sync, null); Spacer(Modifier.width(8.dp)); Text("Sync now") }
                    HorizontalDivider()
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) { Column(Modifier.weight(1f)) { Text("Automatic status sync", fontWeight = FontWeight.SemiBold); Text("Only connection status. No location or app usage.", style = MaterialTheme.typography.bodySmall) }; Switch(checked = vm.syncEnabled, onCheckedChange = { vm.toggleSync(it) }, enabled = !vm.busy) }
                    Text("Android may delay background updates to save battery. Updates are not continuous.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    OutlinedButton(onClick = { confirm = true }, enabled = !vm.busy, modifier = Modifier.fillMaxWidth()) { Icon(Icons.Outlined.LinkOff, null); Spacer(Modifier.width(8.dp)); Text("Disconnect this phone") }
                }
            } else if (tab == 1) {
                Text("You choose what to share.", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.SemiBold)
                StatusRow(Icons.Outlined.Wifi, "Device status", if (vm.enrolled == null) "Not paired" else if (vm.syncEnabled) "Automatic sync enabled" else "Manual sync only")
                HorizontalDivider(); StatusRow(Icons.Outlined.LocationOff, "Location", "Not collected · future milestone")
                HorizontalDivider(); StatusRow(Icons.Outlined.BarChart, "App usage", "Not collected · future milestone")
                Text("No location or Usage Access permissions are requested by this version.", style = MaterialTheme.typography.bodyMedium)
            } else {
                Icon(Icons.Outlined.Shield, null, Modifier.size(52.dp), tint = MaterialTheme.colorScheme.primary)
                Text("Privacy is the starting point.", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.SemiBold)
                Text("This version sends the phone's paired name and connection timestamps to your Haven dashboard. It does not collect location, app usage, messages, calls, camera or microphone data.")
                HorizontalDivider(); Text("Secure pairing", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold); Text("The code works once. Your phone stores its credential encrypted with Android Keystore. The server stores only a hash. Pairing expires after 90 days.")
                HorizontalDivider(); Text("Your right to disconnect", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold); Text("Disconnecting while online removes this phone and its device history from the dashboard. Account audit entries are retained. You can also remove the phone from the dashboard. Uninstalling alone does not delete server data.")
                Text("Haven Android · 0.1.0", style = MaterialTheme.typography.labelSmall)
            }
            vm.message?.let { Text(it, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodyMedium) }
        }
    }
    if (confirm) AlertDialog(onDismissRequest = { confirm = false }, title = { Text("Disconnect this phone?") }, text = { Text("Pairing and device history will be deleted from the dashboard. You need internet to confirm this. You can pair again with a new code.") }, confirmButton = { TextButton(onClick = { confirm = false; vm.disconnect() }) { Text("Disconnect") } }, dismissButton = { TextButton(onClick = { confirm = false }) { Text("Cancel") } })
}
@Composable private fun Pairing(vm: HavenViewModel) {
    var server by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var consent by remember { mutableStateOf(false) }
    Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Icon(Icons.Outlined.PhoneAndroid, null, Modifier.size(56.dp), tint = MaterialTheme.colorScheme.primary)
        Text("Your phone.\nYour permission.", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.SemiBold)
        Text("Pair with your Haven dashboard", style = MaterialTheme.typography.titleMedium)
        OutlinedTextField(value = server, onValueChange = { server = it }, label = { Text("Dashboard HTTPS address") }, placeholder = { Text("https://your-dashboard.lovable.app") }, singleLine = true, modifier = Modifier.fillMaxWidth(), enabled = !vm.busy)
        OutlinedTextField(value = code, onValueChange = { code = it.uppercase().take(8) }, label = { Text("Pairing code") }, supportingText = { Text("Eight characters · expires in 10 minutes") }, singleLine = true, modifier = Modifier.fillMaxWidth(), enabled = !vm.busy)
        Row(verticalAlignment = Alignment.Top) { Checkbox(checked = consent, onCheckedChange = { consent = it }, enabled = !vm.busy); Text("I agree to link this phone and share its name and connection status with this dashboard. Location and app usage stay off.", style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 12.dp)) }
        Button(onClick = { vm.pair(server, code) }, enabled = consent && Rules.validCode(code) && !vm.busy, modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp)) { Icon(Icons.Outlined.Link, null); Spacer(Modifier.width(8.dp)); Text("Pair this phone") }
    }
}
@Composable private fun StatusRow(icon: ImageVector, title: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) { Icon(icon, null, tint = MaterialTheme.colorScheme.primary); Column { Text(title, fontWeight = FontWeight.SemiBold); Text(value, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) } }
}
