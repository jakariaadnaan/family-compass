package app.haven.mobile
import org.junit.Assert.*
import org.junit.Test
class RulesTest {
    @Test fun codesHaveExactlyEightValidCharacters() { assertTrue(Rules.validCode("ABCD2345")); assertFalse(Rules.validCode("ABC")); assertFalse(Rules.validCode("ABCD1234")) }
    @Test fun statusWorkUsesFifteenMinuteMinimum() { assertEquals(15L, Rules.HEARTBEAT_MINUTES) }
    @Test fun httpsOriginIsAccepted() { assertEquals("https://haven.example", Rules.endpoint(" https://haven.example/ ")) }
    @Test fun cleartextAndCredentialsAndPathsAreRejected() {
        for (address in listOf("http://haven.example", "https://user:password@haven.example", "https://haven.example/dashboard", "https://haven.example?token=x")) { assertTrue(runCatching { Rules.endpoint(address) }.isFailure) }
    }
}
