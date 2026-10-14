package com.dev.SaeKimJP.util;

import java.util.LinkedHashMap;
import java.util.Map;

public final class FrontPagePathUtils {

    private static final Map<String, String> LEGACY_TO_CANONICAL = createLegacyPathMap();

    private FrontPagePathUtils() {
    }

    public static String normalizeInternalPagePath(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        String normalized = value.trim();

        for (Map.Entry<String, String> entry : LEGACY_TO_CANONICAL.entrySet()) {
            String legacy = entry.getKey();
            if (normalized.equals(legacy)) {
                return entry.getValue();
            }
            if (normalized.startsWith(legacy + "?") || normalized.startsWith(legacy + "#")) {
                return entry.getValue() + normalized.substring(legacy.length());
            }
        }

        return normalized;
    }

    private static Map<String, String> createLegacyPathMap() {
        Map<String, String> map = new LinkedHashMap<>();

        map.put("/eyeSurgeryPgae", "/eyeSurgeryPage");
        map.put("/noseSurgeryPgae", "/noseSurgeryPage");
        map.put("/youngSurgeryPgae", "/youngSurgeryPage");
        map.put("/contouringSurgeryPgae", "/contouringSurgeryPage");
        map.put("/faqPgae", "/faqPage");
        map.put("/noticePgae", "/noticePage");
        map.put("/contactPgae", "/contactPage");

        map.put("/event", "/eventPage");
        map.put("/faq", "/faqPage");
        map.put("/notice", "/noticePage");
        map.put("/contact", "/contactPage");

        return map;
    }
}
