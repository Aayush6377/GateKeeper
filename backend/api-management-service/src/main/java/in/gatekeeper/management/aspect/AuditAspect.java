package in.gatekeeper.management.aspect;

import in.gatekeeper.management.annotations.Auditable;
import in.gatekeeper.management.enums.AuditResult;
import in.gatekeeper.management.service.audit.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditService auditService;
    private final ExpressionParser parser = new SpelExpressionParser();
    private final DefaultParameterNameDiscoverer parameterNameDiscoverer = new DefaultParameterNameDiscoverer();

    @Around("@annotation(auditable)")
    public Object audit(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        long startedAt = System.nanoTime();

        Object result;

        try{
            result = joinPoint.proceed();
        } catch (Throwable exception) {
            try{
                recordAudit(
                        joinPoint,
                        auditable,
                        null,
                        startedAt,
                        AuditResult.FAILURE,
                        exception.getClass().getName()
                );

            } catch (Exception auditException) {
                log.error("Could not save failure audit record", auditException);
                exception.addSuppressed(auditException);
            }

            throw exception;
        }

        recordAudit(
                joinPoint,
                auditable,
                result,
                startedAt,
                AuditResult.SUCCESS,
                auditable.details()
        );

        return result;
    }

    private void recordAudit(
            ProceedingJoinPoint joinPoint,
            Auditable auditable,
            Object result,
            long startedAt,
            AuditResult auditResult,
            String details
    ) {
        StandardEvaluationContext context = createEvaluationContext(joinPoint, result);

        String resourceId = evaluateString(auditable.resourceId(), context);

        UUID organizationId = evaluateUUID(auditable.organizationId(), context);

        auditService.record(
                AuditService.AuditRecordInput.builder()
                        .organizationId(organizationId)
                        .action(auditable.action())
                        .resourceType(auditable.resourceType())
                        .resourceId(resourceId)
                        .startedAt(startedAt)
                        .details(details)
                        .result(auditResult)
                        .build()
        );
    }

    private StandardEvaluationContext createEvaluationContext(ProceedingJoinPoint joinPoint, Object result) {
        StandardEvaluationContext context = new StandardEvaluationContext();

        context.setVariable("result", result);

        Object[] args = joinPoint.getArgs();

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();

        String[] parameterNames = parameterNameDiscoverer.getParameterNames(signature.getMethod());

        for (int i = 0; i < args.length; i++){

            // index based
            context.setVariable("p" + i, args[i]);
            context.setVariable("a" + i, args[i]);

            // name based
            if (parameterNames != null && i < parameterNames.length){
                context.setVariable(parameterNames[i], args[i]);
            }
        }

        return context;
    }

    private String evaluateString(String expression, StandardEvaluationContext context) {
        if (expression == null || expression.isBlank()){
            return null;
        }

        Object value = parser.parseExpression(expression).getValue(context);

        return value == null ? null : value.toString();
    }

    private UUID evaluateUUID(String expression, StandardEvaluationContext context) {
        if (expression == null || expression.isBlank()){
            return null;
        }

        Object value = parser.parseExpression(expression).getValue(context);

        if (value == null){
            return null;
        }

        if (value instanceof UUID uuid){
            return uuid;
        }

        return UUID.fromString(value.toString());
    }
}
