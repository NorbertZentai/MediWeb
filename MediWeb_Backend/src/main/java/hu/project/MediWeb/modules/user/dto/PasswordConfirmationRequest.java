package hu.project.MediWeb.modules.user.dto;

public class PasswordConfirmationRequest {
    private String password;

    public PasswordConfirmationRequest() {}

    public PasswordConfirmationRequest(String password) {
        this.password = password;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
