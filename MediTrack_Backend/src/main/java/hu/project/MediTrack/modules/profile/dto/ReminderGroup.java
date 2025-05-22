package hu.project.MediTrack.modules.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReminderGroup {
    private String dayFull;
    private String dayShort;
    private List<String> times;
}