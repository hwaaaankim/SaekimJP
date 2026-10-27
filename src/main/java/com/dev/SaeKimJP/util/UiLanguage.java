package com.dev.SaeKimJP.util;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/** Fixed UI strings only. Registered content is never translated here. */
public final class UiLanguage {
    private UiLanguage() {}

    public static boolean isAdmin() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) {
            return true;
        }
        var request = attributes.getRequest();
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return path.equals("/admin") || path.startsWith("/admin/")
                || path.equals("/administration") || path.startsWith("/administration/")
                || path.equals("/loginForm") || path.equals("/signinProcess");
    }

    public static String text(String korean, String japanese) {
        return isAdmin() ? korean : japanese;
    }

    public static String label(String japanese) {
        if (!isAdmin() || japanese == null) return japanese;
        return switch (japanese) {
            case "目元" -> "눈";
            case "エイジングケア" -> "동안";
            case "鼻" -> "코";
            case "輪郭" -> "윤곽";
            case "Before 正面" -> "Before 정면";
            case "Before 45度" -> "Before 45도";
            case "Before 90度" -> "Before 90도";
            case "After 正面" -> "After 정면";
            case "After 45度" -> "After 45도";
            case "After 90度" -> "After 90도";
            default -> japanese;
        };
    }
}
