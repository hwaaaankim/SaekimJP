package com.dev.SaeKimJP.model.contact;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "contact_inquiry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactInquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "preferred_date", nullable = false, length = 20)
    private String preferredDate;

    @Column(name = "preferred_time", nullable = false, length = 20)
    private String preferredTime;

    @Column(name = "email", nullable = false, length = 120)
    private String email;

    @Column(name = "surgery_experience", nullable = false)
    private Boolean surgeryExperience;

    @Column(name = "revision_surgery", nullable = false)
    private Boolean revisionSurgery;

    @Column(name = "customer_memo", columnDefinition = "TEXT")
    private String customerMemo;

    @Column(name = "admin_memo", columnDefinition = "TEXT")
    private String adminMemo;

    @Column(name = "confirmed", nullable = false)
    private Boolean confirmed;

    @Column(name = "privacy_agreement_required", nullable = false)
    private Boolean privacyAgreementRequired;

    @Column(name = "third_party_agreement_required", nullable = false)
    private Boolean thirdPartyAgreementRequired;

    @Column(name = "privacy_agreement_optional", nullable = false)
    private Boolean privacyAgreementOptional;

    @Column(name = "inquiry_at", nullable = false)
    private LocalDateTime inquiryAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        normalizeFields();

        LocalDateTime now = LocalDateTime.now();
        if (this.inquiryAt == null) {
            this.inquiryAt = now;
        }
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        normalizeFields();
        this.updatedAt = LocalDateTime.now();
    }

    private void normalizeFields() {
        this.preferredDate = normalizeText(this.preferredDate);
        this.preferredTime = normalizeText(this.preferredTime);
        this.email = normalizeText(this.email);
        this.customerMemo = normalizeText(this.customerMemo);
        this.adminMemo = normalizeText(this.adminMemo);

        if (this.surgeryExperience == null) {
            this.surgeryExperience = false;
        }
        if (this.revisionSurgery == null) {
            this.revisionSurgery = false;
        }
        if (this.confirmed == null) {
            this.confirmed = false;
        }
        if (this.privacyAgreementRequired == null) {
            this.privacyAgreementRequired = false;
        }
        if (this.thirdPartyAgreementRequired == null) {
            this.thirdPartyAgreementRequired = false;
        }
        if (this.privacyAgreementOptional == null) {
            this.privacyAgreementOptional = false;
        }
    }

    private String normalizeText(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "-";
        }
        return value.trim();
    }
}