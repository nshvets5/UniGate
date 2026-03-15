FROM quay.io/keycloak/keycloak:24.0

USER root

COPY avast-web-mail-shield-root.crt /tmp/avast-web-mail-shield-root.crt

RUN keytool -importcert \
    -cacerts \
    -storepass changeit \
    -noprompt \
    -alias avast-web-mail-shield-root \
    -file /tmp/avast-web-mail-shield-root.crt

USER 1000
