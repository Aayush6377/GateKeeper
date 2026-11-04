package in.gatekeeper.management.dto.responseDto;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

public record PageResponse<T>(
        List<T> content,

        int page,
        int limit,

        long totalElements,
        int totalPages,

        boolean first,
        boolean last,
        boolean hasNext,
        boolean hasPrevious
) {
    public static <T> PageResponse<T> from(Page<T> page) {

        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                page.hasNext(),
                page.hasPrevious()
        );
    }

    public static <S,T> PageResponse<T> from(Page<S> page, Function<S,T> mapper) {

        Page<T> mappedPage = page.map(mapper);

        return PageResponse.from(mappedPage);
    }
}
