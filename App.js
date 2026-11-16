

import React, { useState } from "react";

import {

  View,

  Text,

  TextInput,

  ScrollView,

  TouchableOpacity,

  StyleSheet,

  StatusBar,

  SafeAreaView,

  Alert,

  Modal,

} from "react-native";



import { Ionicons } from "@expo/vector-icons";

import {

  CameraView,

  useCameraPermissions,

} from "expo-camera";



const VERDE = "#087D48";

const VERDE_CLARO = "#E7F5EC";

const FUNDO = "#F7F9F6";



const dadosIniciais = [

  { id: "1", nome: "Leite", quantidade: "2", unidade: "Litros", categoria: "Laticínios", validade: "05/11/2026", emoji: "🥛" },

  { id: "2", nome: "Ovos", quantidade: "12", unidade: "Unidades", categoria: "Proteínas", validade: "10/11/2026", emoji: "🥚" },

  { id: "3", nome: "Alface", quantidade: "1", unidade: "Unidades", categoria: "Verduras", validade: "15/11/2026", emoji: "🥬" },

  { id: "4", nome: "Tomate", quantidade: "3", unidade: "Unidades", categoria: "Verduras", validade: "20/11/2026", emoji: "🍅" },

  { id: "5", nome: "Arroz", quantidade: "2", unidade: "Kg", categoria: "Grãos", validade: "27/04/2027", emoji: "🍚" },

  { id: "6", nome: "Feijão", quantidade: "1", unidade: "Kg", categoria: "Grãos", validade: "27/06/2027", emoji: "🫘" },

];



const categorias = [

  { nome: "Frutas", emoji: "🍎" },

  { nome: "Verduras", emoji: "🥦" },

  { nome: "Laticínios", emoji: "🥛" },

  { nome: "Grãos", emoji: "🌾" },

];



const receitas = [

  { nome: "Omelete de legumes", emoji: "🍳", tempo: "15 min", nivel: "Fácil", ingredientes: "Ovos, tomate e alface" },

  { nome: "Arroz de forno", emoji: "🍲", tempo: "30 min", nivel: "Médio", ingredientes: "Arroz, tomate e queijo" },

  { nome: "Salada fresca", emoji: "🥗", tempo: "10 min", nivel: "Fácil", ingredientes: "Alface e tomate" },

];




function Campo({ label, valor, alterar, placeholder, teclado }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={alterar}
        placeholder={placeholder}
        placeholderTextColor="#9AA59D"
        keyboardType={teclado || "default"}
      />
    </View>
  );
}

export default function App() {

  const [tela, setTela] = useState("Início");

  // AUTENTICAÇÃO DEMONSTRATIVA (os dados ficam apenas na memória)
  const [autenticado, setAutenticado] = useState(false);
  const [modoAcesso, setModoAcesso] = useState("login");
  const [usuarioCadastrado, setUsuarioCadastrado] = useState(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");

  const [cadastroEmail, setCadastroEmail] = useState("");
  const [cadastroNome, setCadastroNome] = useState("");
  const [cadastroSobrenome, setCadastroSobrenome] = useState("");
  const [cadastroCelular, setCadastroCelular] = useState("");
  const [cadastroCpf, setCadastroCpf] = useState("");
  const [cadastroSenha, setCadastroSenha] = useState("");



  const [alimentos, setAlimentos] = useState(dadosIniciais);



  const [busca, setBusca] = useState("");

  const [filtro, setFiltro] = useState("Todas");



  const [nome, setNome] = useState("");

  const [quantidade, setQuantidade] = useState("1");

  const [unidade, setUnidade] = useState("Unidades");

  const [categoria, setCategoria] = useState("Verduras");

  const [validade, setValidade] = useState("31/12/2026");



  const [editando, setEditando] = useState(null);



  const [scannerVisivel, setScannerVisivel] = useState(false);

  const [qrLido, setQrLido] = useState(false);



  const [permissaoCamera, solicitarPermissaoCamera] =

    useCameraPermissions();



  const [receitaSelecionada, setReceitaSelecionada] = useState(null);



  const [perfilNome, setPerfilNome] = useState("Lucas Jorge");

  const [notificacoes, setNotificacoes] = useState(true);



  // -------------------------
  // VALIDADE DOS ALIMENTOS
  // -------------------------
  function diasRestantes(data) {

    const partes = data.split("/");



    if (partes.length !== 3) return 9999;



    const [dia, mes, ano] = partes.map(Number);



    const vencimento = new Date(ano, mes - 1, dia);

    const hoje = new Date();



    hoje.setHours(0, 0, 0, 0);

    vencimento.setHours(0, 0, 0, 0);



    return Math.ceil(

      (vencimento - hoje) / 86400000

    );

  }



  function situacao(alimento) {

    const dias = diasRestantes(alimento.validade);



    if (dias < 0) {

      return {

        texto: "Vencido",

        cor: "#FCE8E8",

        textoCor: "#C62828",

      };

    }



    if (dias <= 3) {

      return {

        texto: dias === 0

          ? "Vence hoje"

          : `Vence em ${dias} dias`,

        cor: "#FFF0D2",

        textoCor: "#A66300",

      };

    }



    return {

      texto: `Vence em ${dias} dias`,

      cor: "#DDF5E4",

      textoCor: "#187443",

    };

  }



  const vencidos = alimentos.filter(

    a => diasRestantes(a.validade) < 0

  );



  const proximos = alimentos.filter(

    a =>

      diasRestantes(a.validade) >= 0 &&

      diasRestantes(a.validade) <= 3

  );



  // -------------------------
  // LEITOR DE QR CODE
  // -------------------------
  async function abrirLeitorQR() {

    if (!permissaoCamera?.granted) {

      const resultado = await solicitarPermissaoCamera();



      if (!resultado.granted) {

        Alert.alert(

          "Permissão necessária",

          "Precisamos acessar sua câmera para ler QR Codes."

        );

        return;

      }

    }



    setQrLido(false);

    setScannerVisivel(true);

  }



  function lerQRCode(resultado) {

    if (qrLido) return;



    setQrLido(true);



    const conteudo = resultado.data;



    try {

      const dados = JSON.parse(conteudo);



      setNome(

        dados.nome ||

        dados.name ||

        dados.produto ||

        conteudo

      );



      if (dados.quantidade) {

        setQuantidade(String(dados.quantidade));

      }



      if (dados.categoria) {

        setCategoria(dados.categoria);

      }



      if (dados.validade) {

        setValidade(dados.validade);

      }



    } catch {

      setNome(conteudo);

    }



    setScannerVisivel(false);



    Alert.alert(

      "QR Code identificado!",

      "O conteúdo foi lido. Confira os dados antes de salvar."

    );

  }



  // -------------------------
  // CADASTRO E EDIÇÃO
  // -------------------------
  function abrirCadastro(alimento = null) {

    setEditando(alimento);



    setNome(alimento?.nome || "");

    setQuantidade(alimento?.quantidade || "1");

    setUnidade(alimento?.unidade || "Unidades");

    setCategoria(alimento?.categoria || "Verduras");

    setValidade(alimento?.validade || "31/12/2026");



    setTela("Cadastro");

  }



  function salvarAlimento() {

    if (!nome.trim() || !quantidade.trim() || !validade.trim()) {

      Alert.alert(

        "Campos obrigatórios",

        "Preencha nome, quantidade e validade."

      );

      return;

    }



    if (!/^\d+([.,]\d+)?$/.test(quantidade)) {

      Alert.alert("Quantidade inválida", "Informe uma quantidade numérica.");

      return;

    }



    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(validade)) {

      Alert.alert(

        "Data inválida",

        "Utilize o formato DD/MM/AAAA."

      );

      return;

    }



    const [dia, mes, ano] = validade.split("/").map(Number);

    const data = new Date(ano, mes - 1, dia);



    if (

      data.getDate() !== dia ||

      data.getMonth() !== mes - 1 ||

      data.getFullYear() !== ano

    ) {

      Alert.alert("Data inválida", "Informe uma data existente.");

      return;

    }



    const emojis = {

      Frutas: "🍎",

      Verduras: "🥬",

      Laticínios: "🥛",

      Grãos: "🌾",

      Proteínas: "🥚",

      Outros: "📦",

    };



    const item = {

      id: editando?.id || String(Date.now()),

      nome: nome.trim(),

      quantidade: quantidade.trim(),

      unidade,

      categoria,

      validade,

      emoji: emojis[categoria] || "📦",

    };



    if (editando) {

      setAlimentos(lista =>

        lista.map(a => a.id === editando.id ? item : a)

      );

    } else {

      setAlimentos(lista => [...lista, item]);

    }



    setBusca("");

    setFiltro("Todas");

    setTela("Estoque");

  }



  function excluirAlimento(id) {

    Alert.alert(

      "Excluir alimento",

      "Deseja remover este alimento do estoque?",

      [

        { text: "Cancelar", style: "cancel" },

        {

          text: "Excluir",

          style: "destructive",

          onPress: () => {

            setAlimentos(lista =>

              lista.filter(a => a.id !== id)

            );

            setTela("Estoque");

          },

        },

      ]

    );

  }



  // -------------------------
  // COMPONENTES AUXILIARES
  // -------------------------
  function Botao({ titulo, onPress, icone, secundario }) {

    return (

      <TouchableOpacity

        style={[

          styles.botao,

          secundario && styles.botaoSecundario,

        ]}

        onPress={onPress}

      >

        {icone && (

          <Ionicons

            name={icone}

            size={19}

            color={secundario ? VERDE : "#FFFFFF"}

          />

        )}



        <Text

          style={[

            styles.textoBotao,

            secundario && { color: VERDE },

          ]}

        >

          {titulo}

        </Text>

      </TouchableOpacity>

    );

  }



  function Titulo({ children, direita, onDireita }) {

    return (

      <View style={styles.linhaTitulo}>

        <Text style={styles.tituloSecao}>

          {children}

        </Text>



        {direita && (

          <TouchableOpacity onPress={onDireita}>

            <Text style={styles.link}>{direita}</Text>

          </TouchableOpacity>

        )}

      </View>

    );

  }






  function Seletor({ label, opcoes, valor, alterar }) {

    return (

      <View style={styles.campo}>

        <Text style={styles.label}>{label}</Text>



        <View style={styles.opcoes}>

          {opcoes.map(opcao => (

            <TouchableOpacity

              key={opcao}

              onPress={() => alterar(opcao)}

              style={[

                styles.opcao,

                valor === opcao && styles.opcaoAtiva,

              ]}

            >

              <Text

                style={[

                  styles.textoOpcao,

                  valor === opcao && styles.textoOpcaoAtiva,

                ]}

              >

                {opcao}

              </Text>

            </TouchableOpacity>

          ))}

        </View>

      </View>

    );

  }



  function CardAlimento({ alimento }) {

    const status = situacao(alimento);



    return (

      <View style={styles.cardAlimento}>

        <View style={styles.emojiAlimento}>

          <Text style={{ fontSize: 29 }}>

            {alimento.emoji}

          </Text>

        </View>



        <View style={{ flex: 1 }}>

          <Text style={styles.nomeAlimento}>

            {alimento.nome}

          </Text>



          <Text style={styles.subtexto}>

            {alimento.quantidade} {alimento.unidade}

            {" · "}{alimento.categoria}

          </Text>



          <View style={[

            styles.etiqueta,

            { backgroundColor: status.cor },

          ]}>

            <Text style={{

              color: status.textoCor,

              fontSize: 11,

              fontWeight: "600",

            }}>

              {status.texto}

            </Text>

          </View>

        </View>



        <TouchableOpacity

          onPress={() =>

            Alert.alert(alimento.nome, "Escolha uma ação", [

              { text: "Cancelar", style: "cancel" },

              {

                text: "Editar",

                onPress: () => abrirCadastro(alimento),

              },

              {

                text: "Excluir",

                style: "destructive",

                onPress: () => excluirAlimento(alimento.id),

              },

            ])

          }

        >

          <Ionicons

            name="ellipsis-vertical"

            size={21}

            color="#64716A"

          />

        </TouchableOpacity>

      </View>

    );

  }



  // -------------------------
  // TELA INICIAL
  // -------------------------
  function Inicio() {

    return (

      <>

        <View style={styles.cabecalhoInicio}>

          <View>

            <Text style={styles.subtitulo}>

              Olá, {perfilNome.split(" ")[0]}!

            </Text>

            <Text style={styles.textoSuave}>

              Aqui está o resumo do seu estoque.

            </Text>

          </View>



          <Ionicons name="leaf" size={32} color={VERDE} />

        </View>



        <View style={styles.resumo}>

          {[

            { numero: alimentos.length, texto: "Alimentos", icone: "basket-outline" },

            { numero: proximos.length, texto: "Próximos", icone: "time-outline" },

            { numero: vencidos.length, texto: "Vencidos", icone: "alert-circle-outline" },

          ].map(item => (

            <View style={styles.resumoItem} key={item.texto}>

              <Ionicons name={item.icone} size={23} color="#FFFFFF" />

              <Text style={styles.numeroResumo}>{item.numero}</Text>

              <Text style={styles.textoResumo}>{item.texto}</Text>

            </View>

          ))}

        </View>



        <TouchableOpacity

          style={styles.busca}

          onPress={() => setTela("Estoque")}

        >

          <Ionicons name="search-outline" size={20} color="#758078" />

          <Text style={styles.placeholderBusca}>Buscar alimentos...</Text>

        </TouchableOpacity>



        <View style={styles.linhaBotoes}>

          <TouchableOpacity

            style={styles.atalho}

            onPress={() => abrirCadastro()}

          >

            <Ionicons name="add-circle" size={25} color="#FFFFFF" />

            <Text style={styles.textoAtalho}>Adicionar alimento</Text>

          </TouchableOpacity>



          <TouchableOpacity

            style={styles.atalho}

            onPress={() => setTela("Receitas")}

          >

            <Ionicons name="restaurant" size={25} color="#FFFFFF" />

            <Text style={styles.textoAtalho}>Ver receitas</Text>

          </TouchableOpacity>

        </View>



        <Titulo

          direita="Ver todos"

          onDireita={() => setTela("Alertas")}

        >

          Alertas de hoje

        </Titulo>



        {[...vencidos, ...proximos].slice(0, 3).map(a => (

          <CardAlimento key={a.id} alimento={a} />

        ))}



        {proximos.length === 0 && vencidos.length === 0 && (

          <Text style={styles.textoVazio}>

            Nenhum alimento próximo do vencimento.

          </Text>

        )}



        <Titulo>Estoque por categoria</Titulo>



        <View style={styles.gradeCategorias}>

          {categorias.map(c => (

            <TouchableOpacity

              key={c.nome}

              style={styles.categoriaCard}

              onPress={() => {

                setFiltro(c.nome);

                setTela("Estoque");

              }}

            >

              <Text style={{ fontSize: 27 }}>{c.emoji}</Text>

              <Text style={styles.textoCategoria}>{c.nome}</Text>

              <Text style={styles.subtexto}>

                {alimentos.filter(a => a.categoria === c.nome).length} itens

              </Text>

            </TouchableOpacity>

          ))}

        </View>

      </>

    );

  }



  // -------------------------
  // TELA DE ESTOQUE
  // -------------------------
  function Estoque() {

    const filtrados = alimentos.filter(a => {

      const nomeCorreto = a.nome.toLowerCase().includes(busca.toLowerCase());

      const categoriaCorreta = filtro === "Todas" || a.categoria === filtro;



      return nomeCorreto && categoriaCorreta;

    });



    return (

      <>

        <Text style={styles.tituloPagina}>Meu estoque</Text>

        <Text style={styles.textoSuave}>

          {alimentos.length} alimentos cadastrados

        </Text>



        <View style={styles.buscaInput}>

          <Ionicons name="search-outline" size={20} color="#78837B" />



          <TextInput

            style={{ flex: 1 }}

            placeholder="Buscar alimentos..."

            value={busca}

            onChangeText={setBusca}

          />

        </View>



        <ScrollView horizontal showsHorizontalScrollIndicator={false}>

          <View style={styles.filtros}>

            {["Todas", "Frutas", "Verduras", "Laticínios", "Grãos", "Proteínas", "Outros"].map(c => (

              <TouchableOpacity

                key={c}

                style={[

                  styles.filtro,

                  filtro === c && styles.filtroAtivo,

                ]}

                onPress={() => setFiltro(c)}

              >

                <Text style={{

                  color: filtro === c ? "#FFFFFF" : "#526158",

                  fontSize: 12,

                }}>

                  {c}

                </Text>

              </TouchableOpacity>

            ))}

          </View>

        </ScrollView>



        <Botao

          titulo="Adicionar alimento"

          icone="add"

          onPress={() => abrirCadastro()}

        />



        {filtrados.map(a => (

          <CardAlimento key={a.id} alimento={a} />

        ))}



        {filtrados.length === 0 && (

          <Text style={styles.textoVazio}>

            Nenhum alimento encontrado.

          </Text>

        )}

      </>

    );

  }



  // -------------------------
  // TELA DE CADASTRO
  // -------------------------
  function Cadastro() {

    return (

      <>

        <TouchableOpacity

          style={styles.voltar}

          onPress={() => setTela("Estoque")}

        >

          <Ionicons name="arrow-back" size={23} color={VERDE} />

          <Text style={styles.link}>Voltar ao estoque</Text>

        </TouchableOpacity>



        <Text style={styles.tituloPagina}>

          {editando ? "Editar alimento" : "Adicionar alimento"}

        </Text>



        <View style={styles.ilustracaoCadastro}>

          <Text style={{ fontSize: 50 }}>

            {editando?.emoji || "🥬"}

          </Text>

          <Text style={styles.textoSuave}>

            Cadastro da sua despensa

          </Text>

        </View>



        {*/\* BOTÃO PARA ABRIR A CÂMERA \*/*}



        <TouchableOpacity

          style={styles.botaoQR}

          onPress={abrirLeitorQR}

        >

          <Ionicons name="qr-code-outline" size={27} color={VERDE} />



          <View style={{ flex: 1 }}>

            <Text style={styles.nomeAlimento}>

              Ler QR Code

            </Text>

            <Text style={styles.textoSuave}>

              Escaneie o código pela câmera

            </Text>

          </View>



          <Ionicons name="camera-outline" size={25} color={VERDE} />

        </TouchableOpacity>



        <Campo

          label="Nome do alimento \*"

          valor={nome}

          alterar={setNome}

          placeholder="Ex.: Leite"

        />



        <Campo

          label="Quantidade \*"

          valor={quantidade}

          alterar={setQuantidade}

          placeholder="Ex.: 2"

          teclado="decimal-pad"

        />



        <Seletor

          label="Unidade"

          opcoes={["Unidades", "Kg", "Gramas", "Litros", "ml", "Pacotes"]}

          valor={unidade}

          alterar={setUnidade}

        />



        <Seletor

          label="Categoria"

          opcoes={["Frutas", "Verduras", "Laticínios", "Grãos", "Proteínas", "Outros"]}

          valor={categoria}

          alterar={setCategoria}

        />



        <Campo

          label="Data de validade \*"

          valor={validade}

          alterar={setValidade}

          placeholder="DD/MM/AAAA"

        />



        <Botao

          titulo={editando ? "Salvar alterações" : "Salvar alimento"}

          icone="checkmark-circle-outline"

          onPress={salvarAlimento}

        />



        {editando && (

          <Botao

            titulo="Excluir alimento"

            icone="trash-outline"

            secundario

            onPress={() => excluirAlimento(editando.id)}

          />

        )}

      </>

    );

  }



  // -------------------------
  // TELA DE ALERTAS
  // -------------------------
  function Alertas() {

    const lista = [...vencidos, ...proximos].sort(

      (a, b) => diasRestantes(a.validade) - diasRestantes(b.validade)

    );



    return (

      <>

        <Text style={styles.tituloPagina}>Alertas</Text>

        <Text style={styles.textoSuave}>

          Acompanhe a validade dos alimentos.

        </Text>



        <View style={styles.alertaResumo}>

          <View>

            <Text style={styles.numeroAlerta}>{vencidos.length}</Text>

            <Text>Vencidos</Text>

          </View>



          <View>

            <Text style={styles.numeroAlerta}>{proximos.length}</Text>

            <Text>Próximos</Text>

          </View>

        </View>



        {lista.map(a => (

          <CardAlimento key={a.id} alimento={a} />

        ))}



        {lista.length === 0 && (

          <Text style={styles.textoVazio}>

            Tudo em dia! Nenhum alerta de validade.

          </Text>

        )}



        <Titulo>Dentro da validade</Titulo>



        {alimentos

          .filter(a => diasRestantes(a.validade) > 3)

          .map(a => (

            <CardAlimento key={a.id} alimento={a} />

          ))}

      </>

    );

  }



  // -------------------------
  // TELA DE RECEITAS
  // -------------------------
  function Receitas() {

    if (receitaSelecionada) {

      const r = receitaSelecionada;



      return (

        <>

          <TouchableOpacity

            style={styles.voltar}

            onPress={() => setReceitaSelecionada(null)}

          >

            <Ionicons name="arrow-back" size={23} color={VERDE} />

            <Text style={styles.link}>Voltar às receitas</Text>

          </TouchableOpacity>



          <View style={styles.receitaHero}>

            <Text style={{ fontSize: 85 }}>{r.emoji}</Text>

            <Text style={styles.tituloReceita}>{r.nome}</Text>

            <Text style={styles.textoSuave}>

              {r.tempo} · {r.nivel}

            </Text>

          </View>



          <Titulo>Ingredientes</Titulo>

          <Text style={styles.textoReceita}>{r.ingredientes}</Text>



          <Titulo>Modo de preparo</Titulo>



          {[

            "Separe e lave os ingredientes.",

            "Prepare e corte os alimentos.",

            "Misture ou cozinhe os ingredientes.",

            "Tempere a gosto e sirva.",

          ].map((passo, i) => (

            <View style={styles.passo} key={i}>

              <Text style={styles.numeroPasso}>{i + 1}</Text>

              <Text style={styles.textoReceita}>{passo}</Text>

            </View>

          ))}



          <Text style={styles.dica}>

            Receita demonstrativa, ainda sem integração com IA.

          </Text>

        </>

      );

    }



    return (

      <>

        <Text style={styles.tituloPagina}>Receitas</Text>

        <Text style={styles.textoSuave}>

          Aproveite os ingredientes da sua despensa.

        </Text>



        <View style={styles.painelReceita}>

          <View style={{ flex: 1 }}>

            <Text style={styles.tituloPainel}>

              O que cozinhar hoje?

            </Text>



            <Text style={styles.textoPainel}>

              Descubra pratos usando seus ingredientes.

            </Text>

          </View>



          <Text style={{ fontSize: 48 }}>👨‍🍳</Text>

        </View>



        <Titulo>Receitas sugeridas</Titulo>



        {receitas.map(r => (

          <TouchableOpacity

            key={r.nome}

            style={styles.cardReceita}

            onPress={() => setReceitaSelecionada(r)}

          >

            <Text style={{ fontSize: 42 }}>{r.emoji}</Text>



            <View style={{ flex: 1 }}>

              <Text style={styles.nomeAlimento}>{r.nome}</Text>

              <Text style={styles.subtexto}>{r.ingredientes}</Text>

              <Text style={styles.link}>{r.tempo} · {r.nivel}</Text>

            </View>



            <Ionicons name="chevron-forward" color={VERDE} size={20} />

          </TouchableOpacity>

        ))}

      </>

    );

  }



  // -------------------------
  // TELA DE PERFIL
  // -------------------------
  function Perfil() {

    return (

      <>

        <Text style={styles.tituloPagina}>Meu perfil</Text>



        <View style={styles.perfilCabecalho}>

          <Ionicons name="person-circle" size={55} color={VERDE} />



          <View style={{ flex: 1 }}>

            <Text style={styles.nomeAlimento}>{perfilNome}</Text>

            <Text style={styles.subtexto}>Minha conta</Text>

          </View>

        </View>



        <Campo

          label="Seu nome"

          valor={perfilNome}

          alterar={setPerfilNome}

          placeholder="Digite seu nome"

        />



        <Titulo>Preferências</Titulo>



        <TouchableOpacity

          style={styles.itemPerfil}

          onPress={() => setNotificacoes(!notificacoes)}

        >

          <Ionicons name="notifications-outline" size={23} color={VERDE} />

          <Text style={styles.textoPerfil}>Notificações</Text>

          <Ionicons

            name={notificacoes ? "toggle" : "toggle-outline"}

            size={32}

            color={VERDE}

          />

        </TouchableOpacity>



        <TouchableOpacity

          style={styles.itemPerfil}

          onPress={() =>

            Alert.alert("Sobre", "Despensa Inteligente - versão demonstrativa.")

          }

        >

          <Ionicons name="information-circle-outline" size={23} color={VERDE} />

          <Text style={styles.textoPerfil}>Sobre o aplicativo</Text>

          <Ionicons name="chevron-forward" size={20} color="#78837B" />

        </TouchableOpacity>



        <Botao
          titulo="Sair da conta"
          icone="log-out-outline"
          secundario
          onPress={() => {
            setAutenticado(false);
            setModoAcesso("login");
            setLoginSenha("");
          }}
        />

        <Botao

          titulo="Voltar ao início"

          icone="home-outline"

          onPress={() => setTela("Início")}

        />

      </>

    );

  }




  // -------------------------
  // LOGIN E CADASTRO
  // -------------------------
  function entrar() {
    const email = loginEmail.trim().toLowerCase();

    if (!email || !loginSenha) {
      Alert.alert("Atenção", "Informe seu e-mail e sua senha.");
      return;
    }

    if (
      usuarioCadastrado &&
      email === usuarioCadastrado.email &&
      loginSenha === usuarioCadastrado.senha
    ) {
      setPerfilNome(
        `${usuarioCadastrado.nome} ${usuarioCadastrado.sobrenome}`
      );
      setAutenticado(true);
      setTela("Início");
      setLoginSenha("");
      return;
    }

    Alert.alert(
      "Não foi possível entrar",
      "Confira seus dados. Se ainda não possui uma conta, faça seu cadastro."
    );
  }

  function cadastrar() {
    const email = cadastroEmail.trim().toLowerCase();
    const nomeCompleto = cadastroNome.trim();
    const sobrenome = cadastroSobrenome.trim();
    const celular = cadastroCelular.trim();
    const cpf = cadastroCpf.trim();
    const senha = cadastroSenha;

    if (!email || !nomeCompleto || !sobrenome || !celular || !cpf || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos para continuar.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("E-mail inválido", "Digite um endereço de e-mail válido.");
      return;
    }

    const cpfNumeros = cpf.replace(/\D/g, "");
    if (cpfNumeros.length !== 11) {
      Alert.alert("CPF inválido", "Digite um CPF com 11 números.");
      return;
    }

    const celularNumeros = celular.replace(/\D/g, "");
    if (celularNumeros.length < 10 || celularNumeros.length > 11) {
      Alert.alert(
        "Celular inválido",
        "Digite um número com DDD (10 ou 11 números)."
      );
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Senha muito curta", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setUsuarioCadastrado({
      email,
      nome: nomeCompleto,
      sobrenome,
      celular,
      cpf,
      senha,
    });

    setLoginEmail(email);
    setLoginSenha("");
    setModoAcesso("login");

    Alert.alert(
      "Cadastro realizado",
      "Sua conta foi cadastrada neste dispositivo. Agora entre com seu e-mail e senha."
    );
  }

  function TelaLogin() {
    return (
      <SafeAreaView style={styles.authSafe}>
        <StatusBar barStyle="dark-content" backgroundColor={FUNDO} />
        <ScrollView
          contentContainerStyle={styles.authConteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authMarcaIcone}>
            <Ionicons name="leaf" size={38} color="#FFFFFF" />
          </View>

          <Text style={styles.authTitulo}>Despensa Inteligente</Text>
          <Text style={styles.authSubtitulo}>
            Organize seus alimentos e evite desperdícios.
          </Text>

          <View style={styles.authCard}>
            <Text style={styles.authTituloCard}>Entrar</Text>
            <Text style={styles.authDescricao}>
              Acesse sua conta para continuar.
            </Text>

            <Text style={styles.authLabel}>E-mail</Text>
            <TextInput
              style={styles.authInput}
              value={loginEmail}
              onChangeText={setLoginEmail}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#9AA59D"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.authLabel}>Senha</Text>
            <TextInput
              style={styles.authInput}
              value={loginSenha}
              onChangeText={setLoginSenha}
              placeholder="Digite sua senha"
              placeholderTextColor="#9AA59D"
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.authBotao} onPress={entrar}>
              <Text style={styles.authTextoBotao}>Entrar</Text>
            </TouchableOpacity>

            <View style={styles.authRodape}>
              <Text style={styles.authTextoRodape}>Ainda não tem uma conta?</Text>
              <TouchableOpacity onPress={() => setModoAcesso("cadastro")}>
                <Text style={styles.authLink}> Criar cadastro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function TelaCadastro() {
    return (
      <SafeAreaView style={styles.authSafe}>
        <StatusBar barStyle="dark-content" backgroundColor={FUNDO} />
        <ScrollView
          contentContainerStyle={styles.authConteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authCabecalhoCadastro}>
            <TouchableOpacity onPress={() => setModoAcesso("login")}>
              <Ionicons name="arrow-back" size={25} color={VERDE} />
            </TouchableOpacity>
            <Text style={styles.authTituloCadastro}>Criar conta</Text>
            <View style={{ width: 25 }} />
          </View>

          <Text style={styles.authSubtituloCadastro}>
            Preencha seus dados para começar a usar o Despensa Inteligente.
          </Text>

          <View style={styles.authCard}>
            <Text style={styles.authLabel}>Nome</Text>
            <TextInput
              style={styles.authInput}
              value={cadastroNome}
              onChangeText={setCadastroNome}
              placeholder="Seu nome"
              placeholderTextColor="#9AA59D"
              autoCapitalize="words"
            />

            <Text style={styles.authLabel}>Sobrenome</Text>
            <TextInput
              style={styles.authInput}
              value={cadastroSobrenome}
              onChangeText={setCadastroSobrenome}
              placeholder="Seu sobrenome"
              placeholderTextColor="#9AA59D"
              autoCapitalize="words"
            />

            <Text style={styles.authLabel}>E-mail</Text>
            <TextInput
              style={styles.authInput}
              value={cadastroEmail}
              onChangeText={setCadastroEmail}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#9AA59D"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.authLabel}>Número de celular</Text>
            <TextInput
              style={styles.authInput}
              value={cadastroCelular}
              onChangeText={setCadastroCelular}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#9AA59D"
              keyboardType="phone-pad"
            />

            <Text style={styles.authLabel}>CPF</Text>
            <TextInput
              style={styles.authInput}
              value={cadastroCpf}
              onChangeText={setCadastroCpf}
              placeholder="000.000.000-00"
              placeholderTextColor="#9AA59D"
              keyboardType="numeric"
              maxLength={14}
            />

            <Text style={styles.authLabel}>Senha</Text>
            <TextInput
              style={styles.authInput}
              value={cadastroSenha}
              onChangeText={setCadastroSenha}
              placeholder="Crie uma senha (mínimo 6 caracteres)"
              placeholderTextColor="#9AA59D"
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.authBotao} onPress={cadastrar}>
              <Text style={styles.authTextoBotao}>Cadastrar</Text>
            </TouchableOpacity>

            <View style={styles.authRodape}>
              <Text style={styles.authTextoRodape}>Já tem uma conta?</Text>
              <TouchableOpacity onPress={() => setModoAcesso("login")}>
                <Text style={styles.authLink}> Fazer login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------
  // NAVEGAÇÃO
  // -------------------------
  const abas = [

    { nome: "Início", icone: "home-outline", ativo: "home" },

    { nome: "Estoque", icone: "basket-outline", ativo: "basket" },

    { nome: "Alertas", icone: "notifications-outline", ativo: "notifications" },

    { nome: "Receitas", icone: "restaurant-outline", ativo: "restaurant" },

    { nome: "Mais", icone: "grid-outline", ativo: "grid" },

  ];



  function renderizarTela() {

    switch (tela) {

      case "Início":

        return Inicio();

      case "Estoque":

        return Estoque();

      case "Cadastro":

        return Cadastro();

      case "Alertas":

        return Alertas();

      case "Receitas":

        return Receitas();

      case "Mais":

        return Perfil();

      default:

        return Inicio();

    }

  }



  // Enquanto não houver login, mostrar apenas as telas de acesso.
  if (!autenticado) {
    // TelaLogin e TelaCadastro são funções declaradas dentro de App.
    // Chamá-las como componentes JSX (<TelaLogin />) cria um novo tipo de
    // componente a cada renderização e desmonta os TextInputs após cada tecla.
    // A chamada direta mantém os TextInputs na mesma árvore entre digitações.
    return modoAcesso === "cadastro" ? TelaCadastro() : TelaLogin();
  }

  // -------------------------
  // INTERFACE PRINCIPAL
  // -------------------------
  return (

    <SafeAreaView style={styles.safe}>

      <StatusBar barStyle="dark-content" backgroundColor={FUNDO} />



      <View style={styles.topo}>

        <View style={styles.marca}>

          <View style={styles.marcaIcone}>

            <Ionicons name="leaf" size={26} color="#FFFFFF" />

          </View>



          <View>

            <Text style={styles.marcaTitulo}>Despensa</Text>

            <Text style={styles.marcaTitulo}>Inteligente</Text>

          </View>

        </View>



        <TouchableOpacity onPress={() => setTela("Mais")}>

          <Ionicons name="person-circle-outline" size={31} color={VERDE} />

        </TouchableOpacity>

      </View>



      <ScrollView

        style={styles.conteudo}

        contentContainerStyle={styles.conteudoInterno}

        keyboardShouldPersistTaps="handled"

        showsVerticalScrollIndicator={false}

      >

        {renderizarTela()}

      </ScrollView>



      {/* JANELA DO LEITOR DE QR CODE */}



      <Modal

        visible={scannerVisivel}

        animationType="slide"

        onRequestClose={() => setScannerVisivel(false)}

      >

        <SafeAreaView style={styles.modalCamera}>

          <View style={styles.cabecalhoCamera}>

            <TouchableOpacity

              onPress={() => setScannerVisivel(false)}

            >

              <Ionicons name="close" size={30} color="#FFFFFF" />

            </TouchableOpacity>



            <Text style={styles.tituloCamera}>

              Ler QR Code

            </Text>



            <View style={{ width: 30 }} />

          </View>



          <Text style={styles.instrucaoCamera}>

            Posicione o QR Code dentro do quadrado

            para identificar o alimento.

          </Text>



          <View style={styles.areaCamera}>

            <CameraView

              style={StyleSheet.absoluteFillObject}

              facing="back"

              barcodeScannerSettings={{

                barcodeTypes: ["qr"],

              }}

              onBarcodeScanned={

                qrLido ? undefined : lerQRCode

              }

            />



            <View style={styles.molduraQR}>

              <View style={styles.linhaQR} />

            </View>

          </View>



          <Text style={styles.textoCamera}>

            Aponte a câmera para o QR Code da embalagem.

          </Text>



          <TouchableOpacity

            style={styles.fecharCamera}

            onPress={() => setScannerVisivel(false)}

          >

            <Text style={styles.textoFecharCamera}>

              Cancelar leitura

            </Text>

          </TouchableOpacity>

        </SafeAreaView>

      </Modal>



      {/* MENU INFERIOR */}



      <View style={styles.navegacao}>

        {abas.map(aba => {

          const selecionada = tela === aba.nome ||

            (tela === "Cadastro" && aba.nome === "Estoque");



          return (

            <TouchableOpacity

              key={aba.nome}

              style={styles.aba}

              onPress={() => {

                setTela(aba.nome);

                setBusca("");

                setFiltro("Todas");

                setReceitaSelecionada(null);

              }}

            >

              <Ionicons

                name={selecionada ? aba.ativo : aba.icone}

                size={22}

                color={selecionada ? VERDE : "#7F8982"}

              />



              <Text style={[

                styles.textoAba,

                selecionada && {

                  color: VERDE,

                  fontWeight: "700",

                },

              ]}>

                {aba.nome}

              </Text>

            </TouchableOpacity>

          );

        })}

      </View>

    </SafeAreaView>

  );

}



// -------------------------
// ESTILOS
// -------------------------
const styles = StyleSheet.create({

  // TELAS DE LOGIN E CADASTRO
  authSafe: {
    flex: 1,
    backgroundColor: FUNDO,
  },
  authConteudo: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 35,
  },
  authMarcaIcone: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: VERDE,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  authTitulo: {
    color: VERDE,
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
  },
  authSubtitulo: {
    color: "#718078",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  authTituloCard: {
    color: "#203A2B",
    fontSize: 22,
    fontWeight: "800",
  },
  authDescricao: {
    color: "#78837B",
    fontSize: 13,
    marginTop: 5,
    marginBottom: 22,
  },
  authLabel: {
    color: "#34483B",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 10,
  },
  authInput: {
    height: 49,
    borderWidth: 1,
    borderColor: "#DCE6DE",
    borderRadius: 12,
    paddingHorizontal: 13,
    color: "#203A2B",
    backgroundColor: "#FBFDFC",
    fontSize: 14,
  },
  authBotao: {
    height: 51,
    borderRadius: 13,
    backgroundColor: VERDE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 23,
  },
  authTextoBotao: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  authRodape: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 22,
  },
  authTextoRodape: {
    color: "#718078",
    fontSize: 13,
  },
  authLink: {
    color: VERDE,
    fontSize: 13,
    fontWeight: "800",
  },
  authCabecalhoCadastro: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  authTituloCadastro: {
    color: VERDE,
    fontSize: 24,
    fontWeight: "800",
  },
  authSubtituloCadastro: {
    color: "#718078",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },


  safe: {

    flex: 1,

    backgroundColor: FUNDO,

    paddingTop: StatusBar.currentHeight || 0,

  },



  topo: {

    height: 72,

    paddingHorizontal: 20,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    backgroundColor: "#FFFFFF",

    borderBottomWidth: 1,

    borderBottomColor: "#EAF0EA",

  },



  marca: {

    flexDirection: "row",

    alignItems: "center",

    gap: 9,

  },



  marcaIcone: {

    backgroundColor: VERDE,

    borderRadius: 12,

    width: 43,

    height: 43,

    alignItems: "center",

    justifyContent: "center",

  },



  marcaTitulo: {

    color: VERDE,

    fontSize: 17,

    fontWeight: "800",

    lineHeight: 19,

  },



  conteudo: { flex: 1 },



  conteudoInterno: {

    padding: 19,

    paddingBottom: 30,

  },



  cabecalhoInicio: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 19,

  },



  subtitulo: {

    fontSize: 23,

    fontWeight: "800",

    color: "#193C29",

  },



  textoSuave: {

    color: "#78837B",

    fontSize: 13,

    marginTop: 4,

  },



  resumo: {

    backgroundColor: VERDE,

    borderRadius: 17,

    paddingVertical: 19,

    flexDirection: "row",

    marginBottom: 17,

  },



  resumoItem: {

    flex: 1,

    alignItems: "center",

    gap: 5,

    borderRightWidth: 1,

    borderRightColor: "#FFFFFF35",

  },



  numeroResumo: {

    fontSize: 25,

    fontWeight: "800",

    color: "#FFFFFF",

  },



  textoResumo: {

    color: "#FFFFFF",

    fontSize: 11,

  },



  busca: {

    height: 48,

    borderRadius: 14,

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 13,

    flexDirection: "row",

    alignItems: "center",

    gap: 9,

    marginBottom: 15,

  },



  placeholderBusca: {

    flex: 1,

    color: "#879189",

    fontSize: 14,

  },



  buscaInput: {

    height: 48,

    backgroundColor: "#FFFFFF",

    borderRadius: 13,

    paddingHorizontal: 12,

    flexDirection: "row",

    alignItems: "center",

    gap: 9,

    marginVertical: 15,

  },



  linhaBotoes: {

    flexDirection: "row",

    gap: 10,

    marginBottom: 25,

  },



  atalho: {

    flex: 1,

    backgroundColor: VERDE,

    minHeight: 88,

    borderRadius: 14,

    padding: 13,

    justifyContent: "center",

    alignItems: "center",

    gap: 6,

  },



  textoAtalho: {

    color: "#FFFFFF",

    fontWeight: "700",

    fontSize: 12,

  },



  linhaTitulo: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginTop: 12,

    marginBottom: 13,

  },



  tituloSecao: {

    color: "#20372A",

    fontSize: 17,

    fontWeight: "800",

  },



  link: {

    color: VERDE,

    fontSize: 13,

    fontWeight: "700",

  },



  gradeCategorias: {

    flexDirection: "row",

    flexWrap: "wrap",

    gap: 9,

  },



  categoriaCard: {

    width: "48%",

    flexGrow: 1,

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    paddingVertical: 17,

    alignItems: "center",

    gap: 6,

  },



  textoCategoria: {

    color: "#304638",

    fontWeight: "700",

    fontSize: 13,

  },



  tituloPagina: {

    fontSize: 25,

    fontWeight: "800",

    color: "#193C29",

    marginBottom: 5,

  },



  cardAlimento: {

    flexDirection: "row",

    alignItems: "center",

    gap: 12,

    padding: 12,

    backgroundColor: "#FFFFFF",

    borderRadius: 15,

    marginBottom: 10,

  },



  emojiAlimento: {

    width: 59,

    height: 62,

    backgroundColor: "#F1F6F0",

    borderRadius: 13,

    alignItems: "center",

    justifyContent: "center",

  },



  nomeAlimento: {

    fontSize: 15,

    fontWeight: "800",

    color: "#24392B",

  },



  subtexto: {

    fontSize: 12,

    color: "#78837B",

    marginTop: 4,

  },



  etiqueta: {

    alignSelf: "flex-start",

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 10,

    marginTop: 7,

  },



  filtros: {

    flexDirection: "row",

    gap: 8,

    paddingBottom: 14,

  },



  filtro: {

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 14,

    paddingVertical: 10,

    borderRadius: 22,

  },



  filtroAtivo: {

    backgroundColor: VERDE,

  },



  botao: {

    backgroundColor: VERDE,

    minHeight: 48,

    borderRadius: 13,

    alignItems: "center",

    justifyContent: "center",

    flexDirection: "row",

    gap: 8,

    paddingHorizontal: 15,

    marginVertical: 7,

  },



  botaoSecundario: {

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#B6D5C2",

  },



  textoBotao: {

    color: "#FFFFFF",

    fontWeight: "800",

    fontSize: 14,

  },



  voltar: {

    flexDirection: "row",

    alignItems: "center",

    gap: 10,

    marginBottom: 18,

  },



  ilustracaoCadastro: {

    backgroundColor: VERDE_CLARO,

    borderRadius: 17,

    minHeight: 115,

    alignItems: "center",

    justifyContent: "center",

    marginVertical: 18,

    padding: 12,

  },



  botaoQR: {

    backgroundColor: VERDE_CLARO,

    borderWidth: 1,

    borderColor: "#B6D5C2",

    borderRadius: 14,

    padding: 15,

    flexDirection: "row",

    alignItems: "center",

    gap: 12,

    marginBottom: 18,

  },



  campo: { marginBottom: 15 },



  label: {

    fontSize: 13,

    fontWeight: "700",

    color: "#304638",

    marginBottom: 8,

  },



  input: {

    backgroundColor: "#FFFFFF",

    height: 47,

    borderRadius: 11,

    borderWidth: 1,

    borderColor: "#DDE6DD",

    paddingHorizontal: 13,

    color: "#23352A",

    fontSize: 14,

  },



  opcoes: {

    flexDirection: "row",

    flexWrap: "wrap",

    gap: 7,

  },



  opcao: {

    borderWidth: 1,

    borderColor: "#DDE6DD",

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 12,

    paddingVertical: 10,

    borderRadius: 10,

  },



  opcaoAtiva: {

    backgroundColor: VERDE_CLARO,

    borderColor: VERDE,

  },



  textoOpcao: {

    color: "#536359",

    fontSize: 12,

  },



  textoOpcaoAtiva: {

    color: VERDE,

    fontWeight: "800",

  },



  alertaResumo: {

    backgroundColor: VERDE_CLARO,

    padding: 18,

    borderRadius: 15,

    flexDirection: "row",

    justifyContent: "space-around",

    marginVertical: 20,

  },



  numeroAlerta: {

    fontSize: 26,

    fontWeight: "800",

    color: VERDE,

  },



  textoVazio: {

    color: "#78837B",

    textAlign: "center",

    padding: 22,

  },



  painelReceita: {

    backgroundColor: VERDE,

    borderRadius: 17,

    padding: 17,

    flexDirection: "row",

    alignItems: "center",

    marginVertical: 19,

  },



  tituloPainel: {

    color: "#FFFFFF",

    fontSize: 17,

    fontWeight: "800",

  },



  textoPainel: {

    color: "#E5F4E9",

    fontSize: 12,

    marginVertical: 9,

  },



  cardReceita: {

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    padding: 12,

    flexDirection: "row",

    alignItems: "center",

    gap: 12,

    marginBottom: 10,

  },



  receitaHero: {

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 20,

    alignItems: "center",

    marginVertical: 18,

  },



  tituloReceita: {

    fontSize: 21,

    fontWeight: "800",

    color: "#20372A",

    marginVertical: 9,

  },



  textoReceita: {

    fontSize: 14,

    lineHeight: 22,

    color: "#536359",

    flex: 1,

  },



  passo: {

    flexDirection: "row",

    gap: 12,

    alignItems: "center",

    marginVertical: 9,

  },



  numeroPasso: {

    color: VERDE,

    fontWeight: "800",

    fontSize: 18,

  },



  dica: {

    fontSize: 12,

    color: "#89938C",

    marginVertical: 12,

  },



  perfilCabecalho: {

    flexDirection: "row",

    alignItems: "center",

    gap: 13,

    backgroundColor: "#FFFFFF",

    padding: 17,

    borderRadius: 15,

    marginVertical: 20,

  },



  itemPerfil: {

    flexDirection: "row",

    alignItems: "center",

    gap: 12,

    paddingVertical: 17,

    borderBottomWidth: 1,

    borderBottomColor: "#E7ECE7",

  },



  textoPerfil: {

    flex: 1,

    fontSize: 14,

    color: "#34483B",

  },



  navegacao: {

    height: 66,

    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,

    borderTopColor: "#E5ECE5",

    flexDirection: "row",

    justifyContent: "space-around",

    alignItems: "center",

    paddingBottom: 4,

  },



  aba: {

    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    gap: 4,

  },



  textoAba: {

    color: "#7F8982",

    fontSize: 10,

  },



  // ESTILOS DO LEITOR QR CODE
  modalCamera: {

    flex: 1,

    backgroundColor: "#10251A",

    padding: 20,

  },



  cabecalhoCamera: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 25,

  },



  tituloCamera: {

    color: "#FFFFFF",

    fontSize: 21,

    fontWeight: "800",

  },



  instrucaoCamera: {

    color: "#FFFFFF",

    fontSize: 15,

    textAlign: "center",

    marginBottom: 25,

    lineHeight: 23,

  },



  areaCamera: {

    flex: 1,

    maxHeight: 400,

    borderRadius: 20,

    overflow: "hidden",

    justifyContent: "center",

    alignItems: "center",

  },



  molduraQR: {

    width: 250,

    height: 250,

    borderWidth: 3,

    borderColor: "#FFFFFF",

    borderRadius: 20,

    justifyContent: "center",

    alignItems: "center",

  },



  linhaQR: {

    width: "90%",

    height: 2,

    backgroundColor: "#00E676",

  },



  textoCamera: {

    color: "#FFFFFF",

    textAlign: "center",

    fontSize: 14,

    marginVertical: 25,

  },



  fecharCamera: {

    backgroundColor: VERDE,

    padding: 16,

    borderRadius: 13,

    alignItems: "center",

    marginBottom: 15,

  },



  textoFecharCamera: {

    color: "#FFFFFF",

    fontWeight: "800",

    fontSize: 15,

  },

});
