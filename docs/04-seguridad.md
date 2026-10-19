# Stage 4 — Investigación de seguridad informática

Material de estudio del laboratorio, con ejemplos seguros y **solo datos ficticios**.

## 1. ¿Qué es el phishing y cómo funciona?

Phishing = engañar a una persona para que entregue datos (usuario/contraseña, tarjeta)
haciéndose pasar por alguien de confianza. Anatomía típica:

1. **Señuelo**: correo/SMS/red social con urgencia ("su cuenta será bloqueada").
2. **Enlace a página clonada**: copia visual del login real.
3. **Captura**: el formulario envía lo escrito a un servidor del atacante.
4. **Uso**: el atacante inicia sesión real o vende los datos.

Este repo **reproduce la estructura** (formulario → backend → almacenamiento) para
estudiarla, pero **no** guarda el valor de la contraseña: solo el booleano
`has_password`. Esa es, precisamente, la diferencia entre un laboratorio y un kit
de phishing.

## 2. Port forwarding y NAT

- Tu router hace **NAT**: traduce tu IP privada (`192.168.x.x`) a la pública.
- **Port forwarding** = decirle al router "el puerto 80 externo va a este equipo
  interno". Abre la puerta a **toda** Internet.
- Sin esa regla, las conexiones entrantes simplemente **no llegan** (NAT).
- **Cloudflare Tunnel** evita abrir puertos: la VM sale hacia Cloudflare.

## 3. IP, máscaras de subred y puertos

- **IP**: dirección de un equipo (IPv4: `192.168.1.10`).
- **Máscara** (`255.255.255.0` = `/24`): qué parte es red y qué parte es host.
  Indica cuántos equipos caben en la subred (una `/24` → 254 hosts).
- **Puerto**: servicio dentro de un equipo (`3000` = nuestro laboratorio, `80` HTTP,
  `443` HTTPS). Se puede comprobar qué escucha:

```bash
ss -ltnp            # puertos en escucha en tu VM
```

## 4. Exposición accidental de servicios

Causas frecuentes:
- arrancar el server con `HOST=0.0.0.0` **en una red compartida**;
- reglas de firewall mal puestas;
- publicar con un túnel y olvidarlo abierto.

Comprueba y limita:

```bash
# Ver escuchas
sudo ss -ltnp
# Ver reglas de firewall
sudo ufw status          # si está activo: sudo ufw deny 3000
```

Nuestro `docker-compose.yml` mapea solo `127.0.0.1:3000`, justo para evitar esto.

## 5. HTTP vs HTTPS

- **HTTP**: texto claro. Cualquiera en la ruta (Wi-Fi, proxy) puede **leer**
  usuario y contraseña.
- **HTTPS**: cifra con **TLS**. Confidencialidad + integridad + certificado del
  servidor.
- Mira siempre el **candado** y el **dominio** en la barra del navegador.

Demostración local (opcional): captura de tráfico de tu propio laboratorio.

```bash
sudo tcpdump -A -i lo 'tcp port 3000'    # tráfico HTTP local en claro
```

Con HTTPS/túnel ese contenido **no** se vería en claro.

## 6. Protección de contraseñas con hash

- Nunca se almacena la contraseña; se guarda un **hash** (bcrypt, Argon2, scrypt).
- El hash es de **un solo sentido**: no se puede "deshacer".
- Se añade **sal (salt)** por usuario para que dos contraseñas iguales den hashes distintos.
- En este repo los usuarios ficticios se guardan con `bcrypt` (ver `server/src/seed.js`),
  y las contraseñas **introducidas** jamás se guardan.

```js
const hash = bcrypt.hashSync('Demo1234', 10);
bcrypt.compareSync('Demo1234', hash); // true
```

Diferencia con lo que hace un kit de phishing: este guarda el **valor en claro**
(o lo imprime), justo lo que aquí **no** ocurre.

## 7. Cómo detectar páginas sospechosas

- **Dominio** raro: `paypal-seguro-login.xyz` en vez de `paypal.com`.
- Sin **HTTPS** válido, o con certificado de otro dominio.
- Errores de idioma/diseño casi idéntico pero con detalles fuera de lugar.
- URLs con `@`, guiones o subdominios engañosos.
- Urgencia, premios o amenazas ("verifique YA o pierde la cuenta").
- El enlace real no coincide con el texto visible.
- Nunca reutilices contraseña; activa **2FA** siempre que se pueda.

## Conclusión del laboratorio

Entender el flujo (formulario → HTTP → backend → almacenamiento) es lo que permite
**defenderse**: saber que los datos viajan en claro sin HTTPS, que las contraseñas
deben hashearse, y que una URL pública sin autenticación es un riesgo. La regla que
cierra el proyecto: un laboratorio registra **metadatos** (intento, IP, booleano),
nunca secretos.
