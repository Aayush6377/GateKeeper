package in.gatekeeper.management.dto.requestDto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public record PaginationRequest(
        @Min(0)
        Integer page,

        @Min(1)
        @Max(100)
        Integer limit,

        @Size(max = 100)
        String search,

        Sort.Direction direction,

        String sortBy
) {
    public PaginationRequest {
        page = page == null ? 0 : page;
        limit = limit == null ? 20 : limit;
        search = search == null ? "" : search.trim();
        direction = direction == null
                ? Sort.Direction.DESC
                : direction;
        sortBy = sortBy == null || sortBy.isBlank()
                ? "createdAt"
                : sortBy;
    }

    public Pageable toPageable() {
        return PageRequest.of(
                page,
                limit,
                Sort.by(direction, sortBy)
        );
    }
}
