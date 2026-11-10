package com.dev.SaeKimJP.config;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Spring Boot 3 / Java 17. 기존 WebConfig 또는 컨트롤러를 교체하지 않는 추가 설정. */
@Configuration
public class SaekimSeoWebConfig implements WebMvcConfigurer {
    private static final String BRAND = "セギム整形外科";
    private static final Map<String, String[]> PAGES = new LinkedHashMap<>();
    static {
        PAGES.put("/", new String[]{"セギム整形外科｜韓国ソウルに位置する美容外科【日本語サイト】", "韓国・ソウル江南区に位置するセギム整形外科（SAEKIM）の日本語サイト。目・鼻・輪郭形成・リフトアップの手術・施術、症例写真、医院情報をご案内します。"});
        PAGES.put("/aboutPage", new String[]{"医院紹介｜セギム整形外科・韓国ソウル", "セギム整形外科の医院紹介。韓国・ソウル江南区にある当院の診療方針や医院情報をご案内します。"});
        PAGES.put("/eyeSurgeryPage", new String[]{"目元の美容整形・二重整形｜セギム整形外科", "セギム整形外科の目整形をご紹介。二重整形、目再手術、目の下やまぶたのお悩みに関する手術方法をご案内します。"});
        PAGES.put("/noseSurgeryPage", new String[]{"鼻整形・鼻の修正手術｜セギム整形外科", "セギム整形外科の鼻整形をご紹介。鼻筋・鼻先・小鼻のお悩みや鼻の修正手術など、鼻の形に合わせた手術方法をご案内します。"});
        PAGES.put("/contouringSurgeryPage", new String[]{"輪郭整形・頬骨・エラ・顎の整形｜セギム整形外科", "セギム整形外科の輪郭整形をご紹介。頬骨・エラ・顎先のお悩みに合わせた手術方法や、顔全体のバランスを考えた輪郭形成をご案内します。"});
        PAGES.put("/youngSurgeryPage", new String[]{"リフトアップ・エイジングケア｜セギム整形外科", "セギム整形外科のリフトアップ・エイジングケアをご紹介。たるみや年齢による変化に合わせた手術・施術をご案内します。"});
        PAGES.put("/beforeAfterPage", new String[]{"症例写真｜セギム整形外科", "セギム整形外科の手術・施術の症例写真をご紹介します。治療による変化や経過をご確認いただけます。結果には個人差があります。"});
        PAGES.put("/faqPage", new String[]{"よくあるご質問｜セギム整形外科", "セギム整形外科のよくあるご質問。ご来院や手術・施術をご検討の方に向けたご案内をご確認いただけます。"});
        PAGES.put("/noticePage", new String[]{"お知らせ｜セギム整形外科", "セギム整形外科からのお知らせ。医院からのご案内や更新情報をご確認いただけます。"});
        PAGES.put("/eventPage", new String[]{"イベント情報｜セギム整形外科", "セギム整形外科のイベント情報をご案内します。対象となる手術・施術や実施期間など、詳しい条件は各ページをご確認ください。"});
        PAGES.put("/contactPage", new String[]{"お問い合わせ｜セギム整形外科", "セギム整形外科へのお問い合わせをご案内します。手術・施術やご来院に関するご相談方法をご確認ください。"});
        PAGES.put("/index", PAGES.get("/"));
    }
    @Value("${saekim.seo.base-url:https://saekimpsjp.com}")
    private String baseUrl;
    @Value("${saekim.seo.indexable:true}")
    private boolean indexable;
    @Value("${saekim.seo.google-verification:}")
    private String googleVerification;
    @Value("${saekim.seo.naver-verification:}")
    private String naverVerification;
    private final ObjectMapper objectMapper;
    public SaekimSeoWebConfig(ObjectMapper objectMapper) { this.objectMapper = objectMapper; }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public void postHandle(HttpServletRequest request, HttpServletResponse response,
                    Object handler, ModelAndView mav) {
                if (mav == null || mav.wasCleared()) return;
                String view = mav.getViewName();
                if (view != null && (view.startsWith("redirect:") || view.startsWith("forward:"))) return;
                String base = baseUrl.replaceAll("/+$", "");
                URI site = URI.create(base);
                if (!"https".equals(site.getScheme()) || site.getHost() == null
                        || site.getUserInfo() != null || site.getQuery() != null || site.getFragment() != null
                        || (site.getPath() != null && !site.getPath().isEmpty())) {
                    throw new IllegalStateException("saekim.seo.base-url must be an HTTPS origin, without a path");
                }
                String path = request.getRequestURI().substring(request.getContextPath().length());
                Map<String, Object> model = mav.getModel();
                String[] page = PAGES.get(path);
                boolean known = page != null;
                if (!known) page = PAGES.get("/");
                String title = text(model, "seoTitle", known ? page[0]
                        : text(model, "pageTitle", BRAND) + " | 韓国・ソウル");
                String description = text(model, "seoDescription", page[1]);
                // 목록의 페이지/필터 쿼리를 무조건 제거하지 않습니다. 쿼리가 있으면 명시적 URL만 사용합니다.
                String canonical = text(model, "seoCanonicalUrl", null);
                if (canonical == null && known && request.getQueryString() == null) {
                    canonical = base + ("/index".equals(path) ? "/" : path);
                }
                if (canonical != null && !sameOrigin(canonical, site)) canonical = null;
                boolean privatePage = path.startsWith("/administration") || path.startsWith("/api/")
                        || path.startsWith("/login") || path.startsWith("/signin")
                        || path.startsWith("/logout") || path.startsWith("/error");
                boolean allowIndex = indexable && site.getHost().equalsIgnoreCase(request.getServerName())
                        && !privatePage && response.getStatus() < 400
                        && !Boolean.TRUE.equals(model.get("seoNoindex"));
                Map<String, Object> seo = new LinkedHashMap<>();
                seo.put("title", title);
                seo.put("description", description);
                seo.put("canonical", canonical);
                seo.put("image", base + "/front/seo/og/saekim-og-ja.jpg");
                seo.put("robots", allowIndex ? "index, follow, max-image-preview:large" : "noindex, nofollow");
                seo.put("googleVerification", googleVerification);
                seo.put("naverVerification", naverVerification);
                // 홈페이지에만 기관/사이트 구조화 데이터를 출력합니다.
                if (allowIndex && ("/".equals(path) || "/index".equals(path))) {
                    seo.put("jsonLd", jsonLd(base));
                }
                model.put("saekimSeo", seo);
            }
        }).addPathPatterns("/**").excludePathPatterns("/front/**", "/upload/**", "/css/**");
    }
    private static String text(Map<String, Object> model, String key, String fallback) {
        Object value = model.get(key);
        return value instanceof String && !((String) value).isBlank() ? ((String) value).trim() : fallback;
    }
    private static boolean sameOrigin(String value, URI site) {
        try {
            URI url = URI.create(value);
            return "https".equals(url.getScheme()) && site.getHost().equalsIgnoreCase(url.getHost())
                    && url.getPort() == site.getPort() && url.getUserInfo() == null && url.getFragment() == null;
        } catch (IllegalArgumentException ex) { return false; }
    }
    private String jsonLd(String base) {
        Map<String, Object> clinic = new LinkedHashMap<>();
        clinic.put("@type", "MedicalClinic");
        clinic.put("@id", base + "/#clinic");
        clinic.put("name", BRAND);
        clinic.put("alternateName", new String[]{"새김성형외과", "SAEKIM Plastic Surgery"});
        clinic.put("url", base + "/");
        clinic.put("logo", base + "/front/seo/logo/saekim-logo-512.png");
        clinic.put("image", base + "/front/seo/og/saekim-og-ja.jpg");
        clinic.put("sameAs", new String[]{"https://saekimps.co.kr/"});
        clinic.put("address", Map.of("@type", "PostalAddress", "streetAddress", "彦州路856 地下2階～6階（新沙洞）",
                "addressLocality", "江南区", "addressRegion", "ソウル特別市", "addressCountry", "KR"));
        Map<String, Object> website = Map.of("@type", "WebSite", "@id", base + "/#website",
                "url", base + "/", "name", BRAND, "alternateName", "SAEKIM Plastic Surgery",
                "inLanguage", "ja", "publisher", Map.of("@id", base + "/#clinic"));
        try {
            return objectMapper.writeValueAsString(Map.of("@context", "https://schema.org", "@graph", new Object[]{clinic, website}))
                    .replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
                    .replace("\u2028", "\\u2028").replace("\u2029", "\\u2029");
        } catch (JsonProcessingException ex) {
            // 구조화 데이터 실패가 일반 페이지 렌더링을 중단하지 않도록 생략합니다.
            return null;
        }
    }
}
