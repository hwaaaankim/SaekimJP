package com.dev.SaeKimJP.repository.contact;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.dev.SaeKimJP.model.contact.ContactInquiry;

public interface ContactInquiryRepository
        extends JpaRepository<ContactInquiry, Long>, JpaSpecificationExecutor<ContactInquiry> {
}