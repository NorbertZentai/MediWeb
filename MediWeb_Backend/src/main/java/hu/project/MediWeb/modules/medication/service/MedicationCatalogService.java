package hu.project.MediWeb.modules.medication.service;

import hu.project.MediWeb.modules.medication.dto.MedicationListItemResponse;
import hu.project.MediWeb.modules.medication.dto.MedicationSearchCriteria;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.medication.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class MedicationCatalogService {

    private final MedicationRepository medicationRepository;

    public Page<MedicationListItemResponse> search(MedicationSearchCriteria criteria, Pageable pageable) {
        Specification<Medication> spec = buildSpecification(criteria);
        Page<Medication> page = medicationRepository.findAll(spec, adjust(pageable));
        List<MedicationListItemResponse> content = page.stream()
                .map(MedicationCatalogService::mapToListItem)
                .toList();
        return new PageImpl<>(content, page.getPageable(), page.getTotalElements());
    }

    private Pageable adjust(Pageable pageable) {
        Sort defaultSort = Sort.by(Sort.Order.desc("active"), Sort.Order.asc("name"));
        if (pageable == null) {
            return PageRequest.of(0, 40, defaultSort);
        }
        Sort sort = pageable.getSort().isUnsorted() ? defaultSort : pageable.getSort().and(defaultSort);
        int pageNumber = Math.max(pageable.getPageNumber(), 0);
        int size = Math.min(Math.max(pageable.getPageSize(), 1), 100);
        return PageRequest.of(pageNumber, size, sort);
    }

    private Specification<Medication> buildSpecification(MedicationSearchCriteria criteria) {
        Specification<Medication> spec = Specification.where(null);

        if (criteria == null) {
            return spec;
        }

        if (StringUtils.hasText(criteria.query())) {
            String q = criteria.query().toLowerCase(Locale.ROOT);
            spec = spec.and((root, query, builder) -> builder.or(
                    builder.like(builder.lower(root.get("name")), like(q)),
                    builder.like(builder.lower(root.get("substance")), like(q)),
                    builder.like(builder.lower(root.get("registrationNumber")), like(q)),
                    builder.like(builder.lower(root.get("company")), like(q))));
        }

        if (StringUtils.hasText(criteria.atcCode())) {
            String atc = criteria.atcCode().toLowerCase(Locale.ROOT);
            spec = spec.and((root, query, builder) -> builder.like(builder.lower(root.get("atcCode")), like(atc)));
        }

        if (StringUtils.hasText(criteria.registrationNumber())) {
            String reg = criteria.registrationNumber().toLowerCase(Locale.ROOT);
            spec = spec.and(
                    (root, query, builder) -> builder.like(builder.lower(root.get("registrationNumber")), like(reg)));
        }

        spec = spec.and(booleanFilter(criteria.lactoseFree(), root -> root.get("containsLactose"), true));
        spec = spec.and(booleanFilter(criteria.glutenFree(), root -> root.get("containsGluten"), true));
        spec = spec.and(booleanFilter(criteria.benzoateFree(), root -> root.get("containsBenzoate"), true));

        if (Boolean.TRUE.equals(criteria.narcoticOnly())) {
            spec = spec.and((root, query, builder) -> builder.greaterThan(builder.length(root.get("narcotic")), 0));
        }

        // hasFinalSample: check that finalSamplesJson is not null, not empty, and not
        // "[]"
        if (Boolean.TRUE.equals(criteria.hasFinalSample())) {
            spec = spec.and((root, query, builder) -> builder.and(
                    builder.isNotNull(root.get("finalSamplesJson")),
                    builder.notEqual(root.get("finalSamplesJson"), ""),
                    builder.notEqual(root.get("finalSamplesJson"), "[]")));
        }

        // hasDefectedForm: check that defectiveFormsJson is not null, not empty, and
        // not "[]"
        if (Boolean.TRUE.equals(criteria.hasDefectedForm())) {
            spec = spec.and((root, query, builder) -> builder.and(
                    builder.isNotNull(root.get("defectiveFormsJson")),
                    builder.notEqual(root.get("defectiveFormsJson"), ""),
                    builder.notEqual(root.get("defectiveFormsJson"), "[]")));
        }

        // fokozottFelugyelet: direct boolean field on entity
        if (Boolean.TRUE.equals(criteria.fokozottFelugyelet())) {
            spec = spec.and((root, query, builder) -> builder.isTrue(root.get("fokozottFelugyelet")));
        }

        // Authorization date range
        if (criteria.authorisationDateFrom() != null) {
            spec = spec.and((root, query, builder) -> builder.greaterThanOrEqualTo(root.get("authorizationDate"),
                    criteria.authorisationDateFrom()));
        }
        if (criteria.authorisationDateTo() != null) {
            spec = spec.and((root, query, builder) -> builder.lessThanOrEqualTo(root.get("authorizationDate"),
                    criteria.authorisationDateTo()));
        }

        // Revoke date range (using releaseDate as the revoke/withdrawal date)
        if (criteria.revokeDateFrom() != null) {
            spec = spec.and((root, query, builder) -> builder.greaterThanOrEqualTo(root.get("releaseDate"),
                    criteria.revokeDateFrom()));
        }
        if (criteria.revokeDateTo() != null) {
            spec = spec.and((root, query, builder) -> builder.lessThanOrEqualTo(root.get("releaseDate"),
                    criteria.revokeDateTo()));
        }

        return spec;
    }

    private Specification<Medication> booleanFilter(Boolean enabled,
            Function<jakarta.persistence.criteria.Root<Medication>, jakarta.persistence.criteria.Path<Boolean>> extractor,
            boolean invert) {
        if (enabled == null || !enabled) {
            return Specification.where(null);
        }
        return (root, query, builder) -> {
            var path = extractor.apply(root);
            if (invert) {
                return builder.isFalse(path);
            }
            return builder.isTrue(path);
        };
    }

    private static String like(String value) {
        return "%" + value + "%";
    }

    private static MedicationListItemResponse mapToListItem(Medication medication) {
        return new MedicationListItemResponse(
                medication.getId(),
                medication.getName(),
                medication.getSubstance(),
                medication.getAtcCode(),
                medication.getCompany(),
                medication.getStatus(),
                medication.getAuthorizationDate(),
                medication.getImageUrl(),
                !medication.isContainsLactose(),
                !medication.isContainsGluten(),
                !medication.isContainsBenzoate(),
                medication.getNarcotic() != null && !medication.getNarcotic().isBlank(),
                medication.isActive());
    }
}
