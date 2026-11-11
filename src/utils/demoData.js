import emblemSvg from '../assets/raia-monogram.svg?raw';
const emblem = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(emblemSvg);
const id = () => crypto.randomUUID();
const text = (name, content, x, y, width, fontSize, color = '#222222', extra = {}) => ({ id:id(), name, type:'text', text:content, x,y,width,fontSize,color,fontFamily:'Arial', ...extra });
const shape = (name, x,y,width,height,background,borderColor='#d4a359',borderWidth=0,extra={}) => ({ id:id(),name,type:'shape',shape:'rectangle',x,y,width,height,background,borderColor,borderWidth,...extra });
const image = (name,src,x,y,width,height) => ({id:id(),name,type:'image',src,x,y,width,height,fit:'contain'});
const folio = (n, color='#777777') => text('Numero pagina',String(n),8,94,84,6,color,{align:'right'});
export class DemoCatalogGenerator {
  static generate() {
    const cover = {id:'demo-cover',title:'Raia Prestige Lookbook',blank:true,background:'#15171e',gradient:true,backgroundEnd:'#25131a',gradientAngle:135,isCover:true,type:'cover',elements:[
      shape('Cornice bordeaux',5,4,90,92,'transparent','#852233',1),shape('Filetto oro',6,5,88,90,'transparent','#b18a51',.5),
      text('Edizione','EDIZIONE PRESTIGE 2026',12,12,76,9,'#d4a359',{align:'center',letterSpacing:2.4}),
      image('Monogramma R',emblem,39,22,22,16.5),
      text('Titolo RAIA','RAIA',10,42,80,42,'#ffffff',{fontFamily:'Georgia',bold:true,align:'center',letterSpacing:3}),
      text('Descrizione brand','DESIGN, STAMPA E COMUNICAZIONE',12,53,76,9,'#d4a359',{align:'center',letterSpacing:1.4}),
      text('Sottotitolo','PORTFOLIO PROGETTI & FINITURE DI PREGIO',10,59,80,7,'#b1a7ac',{align:'center',letterSpacing:1}),
      text('Sedi','NAPOLI  |  MILANO  |  ROMA',10,88,80,7,'#b1a7ac',{align:'center',letterSpacing:2})
    ]};
    const editorial = {id:'demo-editorial',title:'Editoriale Raia',blank:true,background:'#fffdf9',elements:[
      text('Etichetta','EDITORIALE / 01',9,8,82,7,'#852233',{bold:true,letterSpacing:1.5}),
      text('Titolo editoriale',"Diamo corpo alle tue idee.\nDalla carta all’esperienza.",9,15,82,24,'#242329',{fontFamily:'Georgia',italic:true,lineHeight:1.15}),
      shape('Linea editoriale',9,29,12,.3,'#852233'),
      text('Presentazione',"In Raia uniamo l’eccellenza della stampa offset e digitale alla maestria del graphic design contemporaneo.\n\nOgni catalogo, packaging o materiale coordinato nasce per comunicare l’unicità del brand attraverso carte speciali, nobilitazioni a caldo, rilievi a secco e rilegature sartoriali.\n\nQuesto sfogliabile digitale unisce la precisione artigianale della stampa fisica all’accessibilità interattiva per i tuoi clienti.",9,33,82,9,'#62616a',{lineHeight:1.6}),
      text('Servizio stampa','Stampa Fine Art & Nobilitazioni',12,65,78,10,'#25252a',{bold:true}),text('Dettaglio stampa','Lamine a caldo, serigrafia UV spessorata e rilievo',12,68,78,7,'#77747b'),
      text('Servizio design','Graphic Design & Identity',12,74,78,10,'#25252a',{bold:true}),text('Dettaglio design','Progettazione editoriale e packaging su misura',12,77,78,7,'#77747b'),
      text('Servizio digitale','Cataloghi interattivi',12,83,78,10,'#25252a',{bold:true}),text('Dettaglio digitale','Esperienze sfogliabili con link e contenuti multimediali',12,86,78,7,'#77747b'),
      ...[66,75,84].map((y,i)=>shape('Punto elenco '+(i+1),9,y,1,0.75,'#852233','#852233',0,{shape:'ellipse'})),folio(2)
    ]};
    const packaging = {id:'demo-packaging',title:'Packaging Luxury',blank:true,background:'#14161d',elements:[
      text('Etichetta portfolio','PORTFOLIO / SELEZIONE 01',9,8,82,7,'#bc7d85',{bold:true,letterSpacing:1.4}),
      text('Titolo packaging','Packaging di Lusso\n& Scatole Rigide',9,14,82,23,'#ffffff',{fontFamily:'Georgia',bold:true,lineHeight:1.12}),
      shape('Campione packaging',9,31,82,37,'#202531'),shape('Scatola',18,38,64,23,'#191c24','#35333a',1,{rotation:-3}),
      shape('Lamina oro',33,44,34,11,'transparent','#d4a359',1),text('Logo sulla scatola','RAIA COUTURE',34,47,32,9,'#d4a359',{align:'center',letterSpacing:1.4}),text('Dicitura scatola','LIMITED LUXURY BOX',34,51,32,5,'#d4a359',{align:'center',letterSpacing:1}),
      text('Didascalia packaging','Cartoncino accoppiato 2 mm\ncon carta materica Fedrigoni',9,73,82,11,'#ffffff',{lineHeight:1.5}),
      text('Finiture packaging','Stampa a caldo in oro opaco, chiusura calamitata e fustellatura personalizzata.',9,81,82,8,'#9c9aa5',{lineHeight:1.6}),folio(3,'#9c9aa5')
    ]};
    const finishes = {id:'demo-finishes',title:'Nobilitazioni di Pregio',blank:true,background:'#f9f8f5',elements:[
      text('Etichetta tecniche','TECNICHE & NOBILITAZIONI / 02',9,8,82,7,'#852233',{bold:true,letterSpacing:1.3}),
      text('Titolo finiture','Carte Speciali\n& Trattamenti Superficiali',9,14,82,23,'#29272c',{fontFamily:'Georgia',bold:true,lineHeight:1.15}),
      ...[{x:9,y:31,name:'Lamina a Caldo Oro & Rame',bg:'#24252c',edge:'#d4a359',color:'#f0ddba'}, {x:52,y:31,name:'Vernice UV a Spessore',bg:'#17191f',edge:'#852233',color:'#ffffff'}, {x:9,y:57,name:'Rilievo a Secco / Debossing',bg:'#eeebe6',edge:'#bfb9b1',color:'#444044'},{x:52,y:57,name:'Brossura Filo Refe Dorata',bg:'#34252a',edge:'#d4a359',color:'#e1c18e'}].flatMap((sw,i)=>[
        shape('Campione '+(i+1),sw.x,sw.y,39,23,sw.bg,sw.edge,1),text('Sigla campione '+(i+1),'R',sw.x+4,sw.y+3,31,34,sw.color,{fontFamily:'Georgia',align:'center',bold:true}),text('Nome campione '+(i+1),sw.name,sw.x+3,sw.y+17,33,6.5,sw.color)
      ]),
      text('Nota lavorazioni','Ogni lavorazione viene calibrata per esaltare la resa visiva e tattile.',9,86,82,9,'#65616b',{fontFamily:'Georgia',italic:true}),folio(4)
    ]};
    const back = {id:'demo-back',title:'Retro Copertina',blank:true,background:'#101116',gradient:true,backgroundEnd:'#29141c',isBack:true,type:'back',elements:[
      shape('Cornice retro',5,4,90,92,'transparent','#852233',1), image('Monogramma retro',emblem,42,29,16,12),
      text('Brand retro','RAIA',10,46,80,30,'#ffffff',{fontFamily:'Georgia',bold:true,align:'center',letterSpacing:3}),
      text('Descrizione retro','DESIGN, STAMPA E COMUNICAZIONE',10,55,80,8,'#d4a359',{align:'center',letterSpacing:1.3}),
      {...text('Sito web','www.raia.it',20,63,60,10,'#c0b2ba',{align:'center'}),type:'link',url:'https://www.raia.it'},
      {...text('Email','info@raia.it',20,68,60,9,'#c0b2ba',{align:'center'}),type:'link',url:'mailto:info@raia.it'},
      text('Specializzazioni','CATALOGHI / PACKAGING / BRAND IDENTITY',10,85,80,6,'#d4a359',{align:'center',letterSpacing:1})
    ]};
    return [cover,editorial,packaging,finishes,back].map((page,index)=>({...page,pageNumber:index+1}));
  }
}

