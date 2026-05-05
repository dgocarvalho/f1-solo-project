# app/core/logging.py
import logging
import logging.config
"""
Logging Configuration Module

This module defines the logging setup for the application using Python's
standard logging library.

It configures a centralized logging system with:
- Consistent log formatting
- Console output handler
- Structured logging levels
- Integration with Uvicorn server logs

The configuration ensures that both application logs and server logs
are captured in a unified format, improving observability and debugging
capabilities across the system.
"""
def setup_logging() -> None:

    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
            },
        },
        "loggers": {
            # logger “raiz” da sua app
            "app": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            # integrar com uvicorn
            "uvicorn.error": {
                "level": "INFO",
            },
            "uvicorn.access": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
        },
        "root": {  # fallback pra qualquer logger sem config explícita
            "handlers": ["console"],
            "level": "WARNING",
        },
    }

    logging.config.dictConfig(config)