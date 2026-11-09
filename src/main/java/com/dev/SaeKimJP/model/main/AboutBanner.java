package com.dev.SaeKimJP.model.main;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Entity @Table(name = "about_banner")
public class AboutBanner {
    @Id private Long id = 1L;
    @Column(name = "title_text", nullable = false, length = 2000)
    private String titleText;
    @Column(name = "body_text", nullable = false, length = 4000)
    private String bodyText;
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    @Column(name = "image_original_name", length = 255)
    private String imageOriginalName;
    @Version @Column(nullable = false)
    private Long version;
}
