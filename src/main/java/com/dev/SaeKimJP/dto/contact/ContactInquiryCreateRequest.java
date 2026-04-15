package com.dev.SaeKimJP.dto.contact;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactInquiryCreateRequest {

    private String name;
    private String phone;
    private String preferredDate;
    private String preferredTime;
    private String email;
    private Boolean surgeryExperience;
    private Boolean revisionSurgery;
    private String customerMemo;

    private Boolean privacyAgreementRequired;
    private Boolean thirdPartyAgreementRequired;
    private Boolean privacyAgreementOptional;
}