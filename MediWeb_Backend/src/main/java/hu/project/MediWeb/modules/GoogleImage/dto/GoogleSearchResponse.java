package hu.project.MediWeb.modules.GoogleImage.dto;

import java.util.List;

public record GoogleSearchResponse(
        List<GoogleImageItem> items
) {}
