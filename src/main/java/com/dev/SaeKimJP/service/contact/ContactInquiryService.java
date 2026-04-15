package com.dev.SaeKimJP.service.contact;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.dev.SaeKimJP.dto.contact.ContactInquiryAdminDetailResponse;
import com.dev.SaeKimJP.dto.contact.ContactInquiryAdminListResponse;
import com.dev.SaeKimJP.dto.contact.ContactInquiryAdminUpdateRequest;
import com.dev.SaeKimJP.dto.contact.ContactInquiryCreateRequest;
import com.dev.SaeKimJP.dto.contact.ContactInquiryCreateResponse;
import com.dev.SaeKimJP.model.contact.ContactInquiry;
import com.dev.SaeKimJP.repository.contact.ContactInquiryRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactInquiryService {

    private static final Pattern SIMPLE_EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final ContactInquiryRepository contactInquiryRepository;

    @Transactional
    public ContactInquiryCreateResponse create(ContactInquiryCreateRequest request) {
        validateCreateRequest(request);

        ContactInquiry entity = ContactInquiry.builder()
                .name(normalizeRequired(request.getName(), "이름"))
                .phone(formatPhone(request.getPhone()))
                .preferredDate(normalizeOptional(request.getPreferredDate()))
                .preferredTime(normalizeOptional(request.getPreferredTime()))
                .email(normalizeEmail(request.getEmail()))
                .surgeryExperience(Boolean.TRUE.equals(request.getSurgeryExperience()))
                .revisionSurgery(Boolean.TRUE.equals(request.getRevisionSurgery()))
                .customerMemo(normalizeOptional(request.getCustomerMemo()))
                .adminMemo("-")
                .confirmed(false)
                .privacyAgreementRequired(Boolean.TRUE.equals(request.getPrivacyAgreementRequired()))
                .thirdPartyAgreementRequired(Boolean.TRUE.equals(request.getThirdPartyAgreementRequired()))
                .privacyAgreementOptional(Boolean.TRUE.equals(request.getPrivacyAgreementOptional()))
                .build();

        ContactInquiry saved = contactInquiryRepository.save(entity);

        return new ContactInquiryCreateResponse(
                saved.getId(),
                "문의가 완료 되었습니다. 빠르게 연락드리도록 하겠습니다."
        );
    }

    public Page<ContactInquiryAdminListResponse> getAdminPage(String searchType, String keyword, int page, int size) {
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = normalizePageSize(size);

        PageRequest pageable = PageRequest.of(
                normalizedPage,
                normalizedSize,
                Sort.by(Sort.Order.desc("id"))
        );

        Specification<ContactInquiry> specification = buildSearchSpecification(searchType, keyword);

        return contactInquiryRepository.findAll(specification, pageable)
                .map(ContactInquiryAdminListResponse::from);
    }

    @Transactional
    public ContactInquiryAdminDetailResponse getAdminDetail(Long id) {
        ContactInquiry entity = getEntity(id);

        if (!Boolean.TRUE.equals(entity.getConfirmed())) {
            entity.setConfirmed(true);
        }

        return ContactInquiryAdminDetailResponse.from(entity);
    }

    @Transactional
    public ContactInquiryAdminDetailResponse update(Long id, ContactInquiryAdminUpdateRequest request) {
        ContactInquiry entity = getEntity(id);

        validateUpdateRequest(request);

        entity.setName(normalizeRequired(request.getName(), "이름"));
        entity.setPhone(formatPhone(request.getPhone()));
        entity.setPreferredDate(normalizeOptional(request.getPreferredDate()));
        entity.setPreferredTime(normalizeOptional(request.getPreferredTime()));
        entity.setEmail(normalizeEmail(request.getEmail()));
        entity.setSurgeryExperience(Boolean.TRUE.equals(request.getSurgeryExperience()));
        entity.setRevisionSurgery(Boolean.TRUE.equals(request.getRevisionSurgery()));
        entity.setCustomerMemo(normalizeOptional(request.getCustomerMemo()));
        entity.setAdminMemo(normalizeOptional(request.getAdminMemo()));
        entity.setConfirmed(Boolean.TRUE.equals(request.getConfirmed()));

        return ContactInquiryAdminDetailResponse.from(entity);
    }

    @Transactional
    public void delete(Long id) {
        ContactInquiry entity = getEntity(id);
        contactInquiryRepository.delete(entity);
    }

    private ContactInquiry getEntity(Long id) {
        return contactInquiryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 문의입니다."));
    }

    private Specification<ContactInquiry> buildSearchSpecification(String searchType, String keyword) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String likeKeyword = "%" + keyword.trim() + "%";
                String normalizedSearchType = StringUtils.hasText(searchType) ? searchType.trim() : "name";

                switch (normalizedSearchType) {
                    case "phone":
                        predicates.add(criteriaBuilder.like(root.get("phone"), likeKeyword));
                        break;
                    case "email":
                        predicates.add(criteriaBuilder.like(root.get("email"), likeKeyword));
                        break;
                    case "name":
                    default:
                        predicates.add(criteriaBuilder.like(root.get("name"), likeKeyword));
                        break;
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void validateCreateRequest(ContactInquiryCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("잘못된 요청입니다.");
        }
        if (!StringUtils.hasText(request.getName())) {
            throw new IllegalArgumentException("이름은 필수입니다.");
        }
        if (!StringUtils.hasText(request.getPhone())) {
            throw new IllegalArgumentException("연락처는 필수입니다.");
        }
        if (!Boolean.TRUE.equals(request.getPrivacyAgreementRequired())) {
            throw new IllegalArgumentException("개인정보수집 및 이용 동의(필수)에 체크해 주세요.");
        }
        if (!Boolean.TRUE.equals(request.getThirdPartyAgreementRequired())) {
            throw new IllegalArgumentException("개인정보 제3자 제공 동의(필수)에 체크해 주세요.");
        }

        formatPhone(request.getPhone());
        normalizeEmail(request.getEmail());
    }

    private void validateUpdateRequest(ContactInquiryAdminUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("잘못된 요청입니다.");
        }
        if (!StringUtils.hasText(request.getName())) {
            throw new IllegalArgumentException("이름은 필수입니다.");
        }
        if (!StringUtils.hasText(request.getPhone())) {
            throw new IllegalArgumentException("연락처는 필수입니다.");
        }

        formatPhone(request.getPhone());
        normalizeEmail(request.getEmail());
    }

    private int normalizePageSize(int size) {
        if (size == 30 || size == 50 || size == 100) {
            return size;
        }
        return 10;
    }

    private String normalizeRequired(String value, String fieldName) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException(fieldName + "은(는) 필수입니다.");
        }
        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (!StringUtils.hasText(value)) {
            return "-";
        }
        return value.trim();
    }

    private String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return "-";
        }

        String normalized = email.trim();
        if (!SIMPLE_EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("이메일 형식이 올바르지 않습니다.");
        }
        return normalized;
    }

    private String formatPhone(String rawPhone) {
        if (!StringUtils.hasText(rawPhone)) {
            throw new IllegalArgumentException("연락처는 필수입니다.");
        }

        String digits = rawPhone.replaceAll("[^0-9]", "");

        if (digits.length() == 11) {
            return digits.replaceFirst("(\\d{3})(\\d{4})(\\d{4})", "$1-$2-$3");
        }

        if (digits.length() == 10) {
            if (digits.startsWith("02")) {
                return digits.replaceFirst("(\\d{2})(\\d{4})(\\d{4})", "$1-$2-$3");
            }
            return digits.replaceFirst("(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3");
        }

        if (digits.length() == 9 && digits.startsWith("02")) {
            return digits.replaceFirst("(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3");
        }

        throw new IllegalArgumentException("연락처 형식이 올바르지 않습니다.");
    }
}