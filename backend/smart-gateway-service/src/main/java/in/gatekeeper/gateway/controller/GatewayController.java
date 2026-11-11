package in.gatekeeper.gateway.controller;

import in.gatekeeper.gateway.service.GatewayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
public class GatewayController {

    private final GatewayService gatewayService;

    @RequestMapping("/**")
    public ResponseEntity<byte[]> proxy(HttpServletRequest request){
        return gatewayService.handle(request);
    }
}
