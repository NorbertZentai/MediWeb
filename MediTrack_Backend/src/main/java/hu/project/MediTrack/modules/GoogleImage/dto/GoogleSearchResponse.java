package hu.project.MediTrack.modules.GoogleImage.dto;

import java.util.List;

public record GoogleSearchResponse(
        List<GoogleImageItem> items
) {}
