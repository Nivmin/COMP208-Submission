import java.util.Base64;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.NoSuchAlgorithmException;

public class Hasher {
    // basic hashing creates a new salt and stoes it with the hash
    public static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            SecureRandom random = new SecureRandom();
            byte[] salt = new byte[16];
            random.nextBytes(salt); 
            md.update(salt);
            byte[] hashedBytes = md.digest(password.getBytes());
            String saltBase64 = Base64.getEncoder().encodeToString(salt);
            String hashedPassword = Base64.getEncoder().encodeToString(hashedBytes);
            return saltBase64 + "$" + hashedPassword;
        } catch(NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return null;
    }
// uses  the stored password to hash it using the same salt and compares it to the stored hash
    public static boolean checkPassword(String password, String storedPassword) {
        try {
            String[] parts = storedPassword.split("\\$");
            String saltBase64 = parts[0];
            String storedHash = parts[1];
            byte[] salt = Base64.getDecoder().decode(saltBase64);
            byte[] storedHashBytes = Base64.getDecoder().decode(storedHash);
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            byte[] hashBytes = md.digest(password.getBytes());
            return MessageDigest.isEqual(hashBytes, storedHashBytes);
        } catch(Exception e) {
            e.printStackTrace();
        }
        return false;
    }
// main methpd for calling each individual method
    public static void main(String[] args) {
        if (args.length < 2) {
            System.out.println("Usage: java Hasher <hash|check> <password> [storedHash]");
            System.exit(1);
        }

        String operation = args[0];
        String password = args[1];

        if (operation.equals("hash")) {
            System.out.println(hashPassword(password));
        } else if (operation.equals("check") && args.length == 3) {
            String storedHash = args[2];
            System.out.println(checkPassword(password, storedHash));
        } else {
            System.out.println("Invalid operation");
            System.exit(1);
        }
    }
}