package app.haven.mobile

import androidx.compose.material3.Typography
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily

private val sora = FontFamily(Font(R.font.sora))
private val manrope = FontFamily(Font(R.font.manrope))
private val base = Typography()
val HavenTypography = Typography(
    headlineLarge = base.headlineLarge.copy(fontFamily = sora),
    headlineMedium = base.headlineMedium.copy(fontFamily = sora),
    titleLarge = base.titleLarge.copy(fontFamily = sora),
    titleMedium = base.titleMedium.copy(fontFamily = sora),
    bodyLarge = base.bodyLarge.copy(fontFamily = manrope),
    bodyMedium = base.bodyMedium.copy(fontFamily = manrope),
    bodySmall = base.bodySmall.copy(fontFamily = manrope),
    labelLarge = base.labelLarge.copy(fontFamily = manrope),
    labelSmall = base.labelSmall.copy(fontFamily = manrope)
)