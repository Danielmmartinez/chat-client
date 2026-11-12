import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";

export const SERVER = "http://localhost:8080";
const WS_URL = "ws://localhost:8080/ws";

// Emblema Nórdico en SVG Vectorial
function DragonVikingo({ size = 48 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="viking-dragon-svg" fill="none">
        <circle cx="50" cy="50" r="46" stroke="#c9933b" strokeWidth="3" strokeDasharray="6 3" />
        <circle cx="50" cy="50" r="40" stroke="#8b5a2b" strokeWidth="2.5" />
        <path d="M28 68C24 55 30 38 42 28C48 23 58 18 68 18C74 18 80 22 78 28C76 34 68 36 62 38C52 42 46 50 48 62C49 67 46 72 40 72C34 72 30 70 28 68Z" fill="#d4af37" stroke="#4a2511" strokeWidth="2"/>
        <path d="M68 22C74 16 84 14 90 18C86 24 82 28 78 28Z" fill="#ff4d00" stroke="#8b2500" strokeWidth="1.5"/>
        <circle cx="64" cy="24" r="3" fill="#1a0a04"/>
        <path d="M42 38C46 32 54 30 60 32C52 38 48 45 46 52" stroke="#4a2511" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M34 52C38 46 44 44 50 46" stroke="#4a2511" strokeWidth="2" strokeLinecap="round"/>
        <path d="M38 72C42 80 54 84 64 80C72 76 74 66 70 58C66 50 56 46 50 52C44 58 50 68 58 68C64 68 66 62 64 58" stroke="#d4af37" strokeWidth="3" strokeLinecap="round"/>
      </svg>
  );
}

// Antorcha con fuego parpadeante para los mástiles laterales
function Antorcha({ lado }) {
  return (
      <aside className={`mastil-antorcha ${lado}`}>
        <div className="soporte-hierro"></div>
        <div className="cazoleta-bronce"></div>
        <div className="fuego-llama">
          <div className="chispa-nucleo"></div>
        </div>
        <div className="resplandor-antorcha"></div>
      </aside>
  );
}

const CLASES = [
  { rol: "Guerrero", icon: "⚔️", desc: "Acero y honor en batalla" },
  { rol: "Mago", icon: "🔮", desc: "Sabiduría arcana ancestral" },
  { rol: "Pícaro", icon: "🗡️", desc: "Sigilo, sombras y dagas" },
  { rol: "Bardo", icon: "🪕", desc: "Cantares épicos y rumores" },
  { rol: "Paladín", icon: "🛡️", desc: "Votos sagrados inquebrantables" },
  { rol: "Explorador", icon: "🏹", desc: "Rastreador de bestias salvajes" },
];

export default function App() {
  const [usuario, setUsuario] = useState("");
  const [clase, setClase] = useState(CLASES[0].rol);
  const [conectado, setConectado] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  // Modal para clavar contratos en el tablón público
  const [verModalContrato, setVerModalContrato] = useState(false);
  const [tituloContrato, setTituloContrato] = useState("");
  const [recompensa, setRecompensa] = useState("");
  const [descContrato, setDescContrato] = useState("");

  const clientRef = useRef(null);
  const finRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const claseActual = CLASES.find((c) => c.rol === clase) || CLASES[0];
  const nombreCompleto = `${usuario} [${claseActual.rol} ${claseActual.icon}]`;

  // Filtro de contratos fijados en el tablón
  const contratos = mensajes.filter((m) => m.tipo === "CONTRATO");

  function conectar(e) {
    e.preventDefault();
    if (!usuario.trim()) return;

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 3000,
      onConnect: () => {
        setConectado(true);
        client.subscribe("/topic/sala", (frame) => {
          const nuevoMensaje = JSON.parse(frame.body);
          setMensajes((prev) => [...prev, nuevoMensaje]);
        });

        client.publish({
          destination: "/app/chat.unirse",
          body: JSON.stringify({ tipo: "UNION", autor: nombreCompleto })
        });
      },
      onWebSocketClose: () => setConectado(false),
    });

    client.activate();
    clientRef.current = client;
  }

  function enviar(tipo, contenido) {
    clientRef.current?.publish({
      destination: "/app/chat.enviar",
      body: JSON.stringify({ tipo, autor: nombreCompleto, contenido })
    });
  }

  function enviarTexto() {
    if (!texto.trim()) return;
    enviar("TEXTO", texto.trim());
    setTexto("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "52px";
    }
  }

  // Clavar nuevo edicto público en el tablón
  function publicarContrato(e) {
    e.preventDefault();
    if (!tituloContrato.trim() || !descContrato.trim()) return;

    const payload = JSON.stringify({
      titulo: tituloContrato,
      recompensa: recompensa || "Honor y gloria",
      descripcion: descContrato
    });

    enviar("CONTRATO", payload);
    setTituloContrato("");
    setRecompensa("");
    setDescContrato("");
    setVerModalContrato(false);
  }

  function handleInput(e) {
    setTexto(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarTexto();
    }
  }

  async function subirArchivo(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    try {
      setSubiendo(true);
      const datos = new FormData();
      datos.append("archivo", archivo);

      const res = await fetch(SERVER + "/api/archivos", {
        method: "POST",
        body: datos,
      });

      if (!res.ok) throw new Error("Fallo al sellar el pergamino");
      const respuesta = await res.json();
      enviar("IMAGEN", respuesta.url);
    } catch (err) {
      alert("Error: No se pudo subir el pergamino al gremio.");
      console.error(err);
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  useEffect(() => () => clientRef.current?.deactivate(), []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // PANTALLA 1: Entrada del Gran Ayuntamiento Medieval
  if (!conectado) {
    return (
        <div className="login-pantalla">
          <Antorcha lado="antorcha-izq" />
          <Antorcha lado="antorcha-der" />
          <div className="overlay-vignette"></div>

          <form onSubmit={conectar} className="pergamino-login">
            <div className="emblema-wrapper">
              <DragonVikingo size={80} />
            </div>
            <h1>EL GRAN AYUNTAMIENTO</h1>
            <p className="subtitulo">Registro Oficial del Gremio & Salón de Armas Nórdico</p>

            <div className="runas-div">ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ✦ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ✦ ᛇ ᛈ ᛉ ᛊ</div>

            <div className="campo">
              <label>Nombre del Aventurero o Señor feudal</label>
              <input
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ej: Ragnar Lothbrok"
                  required
                  autoFocus
              />
            </div>

            <div className="campo">
              <label>Rango u Oficio Juramentado</label>
              <select value={clase} onChange={(e) => setClase(e.target.value)}>
                {CLASES.map((c) => (
                    <option key={c.rol} value={c.rol}>
                      {c.icon} {c.rol} — {c.desc}
                    </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-medieval">
              🍺 Empujar las Puertas de la Taberna
            </button>
          </form>
        </div>
    );
  }

  // PANTALLA 2: Taberna Nórdica Amplia
  return (
      <div className="taberna-pantalla">
        <Antorcha lado="antorcha-izq" />
        <Antorcha lado="antorcha-der" />
        <div className="overlay-vignette"></div>

        <div className="escenario-completo">

          {/* PANEL IZQUIERDO: Tablón Público de Contratos y Edictos */}
          <aside className="panel-lateral izquierdo">
            <div className="tablon-header">
              <div>
                <h3>📜 TABLÓN DE EDICTOS PÚBLICOS</h3>
                <small>Misiones comunitarias fijadas por aventureros</small>
              </div>
              <button
                  className="btn-nuevo-contrato"
                  onClick={() => setVerModalContrato(true)}
                  title="Fijar un nuevo edicto público"
              >
                🔨 Clavar Edicto
              </button>
            </div>

            <div className="lista-contratos-scroll">
              {contratos.length === 0 ? (
                  <div className="sin-contratos">
                    <span>🕯️</span>
                    <p>No hay edictos activos. ¡Sé el primero en clavar un contrato con recompensa!</p>
                  </div>
              ) : (
                  contratos.map((c, idx) => {
                    const data = JSON.parse(c.contenido);
                    return (
                        <div key={idx} className="bando-contrato-card">
                          <div className="cabecera-bando">
                            <b>{data.titulo}</b>
                            <span className="sello-oro">⚜️ OFICIAL</span>
                          </div>
                          <p className="desc-bando">{data.descripcion}</p>
                          <div className="pie-bando">
                            <span className="recompensa-tag">💰 {data.recompensa}</span>
                            <small>Por: {c.autor}</small>
                          </div>
                        </div>
                    );
                  })
              )}
            </div>

            <div className="taberna-carta">
              <h4>🍺 PRECIOS DE LA BARRA</h4>
              <ul>
                <li>Jarra de hidromiel dorado: <b>2 cobres</b></li>
                <li>Cerveza negra de las minas enanas: <b>4 cobres</b></li>
                <li>Pierna de jabalí asada al romero: <b>8 cobres</b></li>
              </ul>
            </div>
          </aside>

          {/* SALÓN CENTRAL: El Chat en Vivo */}
          <main className="taberna-marco">
            <header className="taberna-header">
              <div className="header-brand">
                <DragonVikingo size={52} />
                <div>
                  <h2>LA TABERNA DEL DRAGÓN VERDE</h2>
                  <small>Salón Comunal de Contratos · Fuego encendido y cantos bárdicos</small>
                </div>
              </div>

              <div className="chapa-aventurero">
                <span className="rol-icono">{claseActual.icon}</span>
                <div className="datos-aventurero">
                  <span className="etiqueta-rango">{claseActual.rol}</span>
                  <b>{usuario}</b>
                </div>
              </div>
            </header>

            <ul className="pergamino-mensajes">
              {mensajes.map((m, i) => (
                  <li
                      key={i}
                      className={`mensaje-fila ${
                          m.tipo === "UNION" || m.tipo === "SALIDA"
                              ? "fila-sistema"
                              : m.tipo === "CONTRATO"
                                  ? "fila-contrato"
                                  : m.autor === nombreCompleto
                                      ? "fila-mia"
                                      : "fila-otro"
                      }`}
                  >
                    {/* Eventos de sistema */}
                    {(m.tipo === "UNION" || m.tipo === "SALIDA") && (
                        <div className="anuncio-heraldo">
                          <span>⚡ {m.contenido}</span>
                          {m.fecha && <small className="hora-heraldo">{m.fecha}</small>}
                        </div>
                    )}

                    {/* Edictos de contratos clavados */}
                    {m.tipo === "CONTRATO" && (() => {
                      const data = JSON.parse(m.contenido);
                      return (
                          <div className="bando-proclamacion-chat">
                            <div className="sello-bando-top">📜 EDICTO PÚBLICO CLAVADO EN EL TABLÓN 📜</div>
                            <h3>{data.titulo}</h3>
                            <p className="cuerpo-edicto">{data.descripcion}</p>
                            <div className="meta-edicto">
                              <span>💰 Recompensa: <b>{data.recompensa}</b></span>
                              <small>Decretado por {m.autor} a las {m.fecha}</small>
                            </div>
                          </div>
                      );
                    })()}

                    {/* Mensajes regulares de texto o imagen */}
                    {m.tipo !== "UNION" && m.tipo !== "SALIDA" && m.tipo !== "CONTRATO" && (
                        <div className="burbuja-pergamino">
                          <div className="autor-tag">{m.autor}</div>

                          {m.tipo === "TEXTO" && <p className="cuerpo-texto">{m.contenido}</p>}

                          {m.tipo === "IMAGEN" && (
                              <div className="contenedor-retrato">
                                <span className="etiqueta-mapa">🗺️ Retrato o Mapa exhibido ante el salón:</span>
                                <img src={SERVER + m.contenido} alt="Retrato compartido" className="imagen-taberna" />
                              </div>
                          )}

                          {m.fecha && <small className="sello-hora">{m.fecha}</small>}
                        </div>
                    )}
                  </li>
              ))}
              <li ref={finRef} />
            </ul>

            {/* BARRA INFERIOR AMPLIADA */}
            <footer className="taberna-barra">
              <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={subirArchivo}
                  style={{ display: "none" }}
              />

              <button
                  type="button"
                  className="btn-pergamino-upload"
                  title="Sellar y exhibir mapa / pergamino"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={subiendo}
              >
                {subiendo ? "⏳" : "📜"}
              </button>

              <div className="contenedor-input-auto">
              <textarea
                  ref={textareaRef}
                  value={texto}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Entona un rumor o alza tu voz en la mesa comunal... (Enter envía, Shift+Enter salta línea)"
              />
              </div>

              <button type="button" onClick={enviarTexto} className="btn-vocalizar">
                Vocalizar ⚔️
              </button>
            </footer>
          </main>

          {/* PANEL DERECHO: El Código de Leyes Inquebrantables */}
          <aside className="panel-lateral derecho panel-leyes">
            <div className="tablon-header-estela">
              <span className="runa-sacra">ᚲ ᛟ ᛞ</span>
              <h3>LEYES DEL GREMIO NÓRDICO</h3>
              <span className="runa-sacra">ᛞ ᛟ ᚲ</span>
            </div>

            <p className="intro-leyes">
              Talladas en la roca del salón comunal por orden de los jarls. El desacato conlleva expulsión o combate en el círculo sagrado.
            </p>

            <div className="lista-leyes-piedra">
              <div className="ley-item">
                <span className="num-runa">I</span>
                <div>
                  <b>LA TREGUA DEL FOGÓN</b>
                  <p>Todo acero permanecerá envainado bajo este techo. Quien desenfunde pagará con oro o sangre.</p>
                </div>
              </div>

              <div className="ley-item">
                <span className="num-runa">II</span>
                <div>
                  <b>LA DEUDA DE LA BARRA</b>
                  <p>Nadie abandona la taberna con hidromiel impago. La cuenta no saldada se cobra en trabajo minero.</p>
                </div>
              </div>

              <div className="ley-item">
                <span className="num-runa">III</span>
                <div>
                  <b>PACTOS SAGRADOS</b>
                  <p>Todo contrato clavado en el tablón es ley. No cumplir la palabra dada mancha el blasón familiar.</p>
                </div>
              </div>

              <div className="ley-item">
                <span className="num-runa">IV</span>
                <div>
                  <b>EL ASILO DEL VIAJERO</b>
                  <p>El errante desarmado que busque abrigo junto al fuego sagrado gozará de inmunidad comunal.</p>
                </div>
              </div>
            </div>

            <div className="pie-estela">
              <span>ᛟ SELLADO POR LOS DIOSES ANTIGUOS ᛟ</span>
            </div>
          </aside>

        </div>

        {/* MODAL PARA PUBLICAR NUEVO CONTRATO EN EL TABLÓN */}
        {verModalContrato && (
            <div className="modal-backdrop">
              <form onSubmit={publicarContrato} className="modal-pergamino">
                <h3>🔨 Clavar Nuevo Edicto en el Tablón</h3>
                <p>Se publicará ante todos los aventureros en la taberna.</p>

                <div className="campo">
                  <label>Título de la Misión o Cacería</label>
                  <input
                      value={tituloContrato}
                      onChange={(e) => setTituloContrato(e.target.value)}
                      placeholder="Ej: Se busca cabeza de Basilisco"
                      required
                  />
                </div>

                <div className="campo">
                  <label>Recompensa Ofrecida</label>
                  <input
                      value={recompensa}
                      onChange={(e) => setRecompensa(e.target.value)}
                      placeholder="Ej: 300 Monedas de Plata y una gema"
                  />
                </div>

                <div className="campo">
                  <label>Descripción del Encargo</label>
                  <textarea
                      value={descContrato}
                      onChange={(e) => setDescContrato(e.target.value)}
                      placeholder="Detalla la ubicación, peligros y requisitos..."
                      rows={3}
                      required
                  />
                </div>

                <div className="modal-acciones">
                  <button type="button" className="btn-cancelar" onClick={() => setVerModalContrato(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-medieval">
                    Clavar Edicto 📜
                  </button>
                </div>
              </form>
            </div>
        )}

      </div>
  );
}