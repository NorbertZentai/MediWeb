import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class TestHash {
    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder().encode("test1234"));
    }
}
