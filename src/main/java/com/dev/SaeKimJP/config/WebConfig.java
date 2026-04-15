package com.dev.SaeKimJP.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Value("${spring.upload.env}")
	private String env;

	@Value("${spring.upload.path}")
	private String commonPath;
	
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String path = Paths.get(commonPath).toUri().toString();

        if (!path.endsWith("/")) {
            path += "/";
        }

        registry.addResourceHandler("/upload/**")
                .addResourceLocations(path);

        registry.addResourceHandler("/administration/upload/**")
                .addResourceLocations(path);
    }
}
