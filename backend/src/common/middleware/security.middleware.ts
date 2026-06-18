import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { Logger } from "nestjs-pino";

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Log request for security auditing
    this.logger.log(
      `${req.method} ${req.path} from ${req.ip}`,
      "SecurityMiddleware",
    );

    // Add custom security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );

    // Log response finish
    res.on("finish", () => {
      this.logger.log(
        `${req.method} ${req.path} ${res.statusCode}`,
        "SecurityMiddleware Response",
      );
    });

    next();
  }
}
