// ====== CONFIGURACIÓN DE TARIFAS ======
// f = campos: [id, etiqueta, valor inicial, opciones (solo listas: [valor, etiqueta])]
// c = función que devuelve los créditos a partir de los valores v
const SZ=(id,l,b)=>[id,l,0,null,b];
export const F={KB:1,MB:1024,GB:1048576};
const MES=['meses','Periodo (meses)',1], dia=n=>n<=10?10:n<=100?20:n<=1000?40:n<=10000?80:n<=100000?160:320;
const MIN30='Con presupuestación de créditos activa se requiere un saldo mínimo de 30 créditos.';
export const S=[
{g:'Almacenamiento',t:'Capas de entidades alojadas',r:'2,4 créditos por 10 MB al mes',f:[SZ('mb','Tamaño almacenado','MB'),MES],c:v=>v.mb/10*2.4*v.meses,n:'No incluye adjuntos, conjuntos de entidades, uso compartido de ubicación ni vistas.'},
{g:'Almacenamiento',t:'Capas de imágenes en teselas',r:'1,2 créditos por GB al mes',f:[SZ('gb','Tamaño almacenado','GB'),MES],c:v=>v.gb*1.2*v.meses},
{g:'Almacenamiento',t:'Capas de imágenes dinámicas',r:'1,2 créditos por GB al mes + tarifa diaria por número de imágenes',f:[SZ('gb','Tamaño almacenado','GB'),['img','Número de imágenes'],MES],c:v=>v.gb*1.2*v.meses+(v.img>0?dia(v.img)*30*v.meses:0),n:'Tarifa diaria: 10 (hasta 10 imágenes) a 320 créditos (más de 100.000). Se usan 30 días por mes.'},
{g:'Almacenamiento',t:'Otro contenido (mapas web, archivos, adjuntos, teselas vectoriales, cachés 3D…)',r:'1,2 créditos por GB al mes',f:[SZ('gb','Tamaño almacenado','GB'),MES],c:v=>v.gb*1.2*v.meses},
{g:'Almacenamiento',t:'Espacio de trabajo de ArcGIS Notebooks',r:'12 créditos por GB al mes y usuario',f:[SZ('gb','Tamaño por usuario','GB'),['usr','Usuarios',1],MES],c:v=>v.gb*12*v.usr*v.meses},
{g:'Transacciones',t:'Geocodificación',r:'40 créditos por 1.000 geocodificaciones',f:[['n','Direcciones']],c:v=>v.n/1000*40},
{g:'Transacciones',t:'Impresión con plantillas personalizadas',r:'5 créditos por trabajo',f:[['n','Trabajos de impresión']],c:v=>v.n*5},
{g:'Transacciones',t:'Análisis de entidades e imágenes',r:'Depende de la herramienta',f:[['ent','Créditos estimados: entidades'],['img','Créditos estimados: imágenes']],c:v=>v.ent+v.img,n:'Use el estimador de créditos de ArcGIS Online antes de ejecutar el análisis e ingrese aquí el valor.'},
{g:'Transacciones',t:'ModelBuilder',r:'50 créditos por hora, mínimo 10 minutos',f:[['ses','Sesiones'],['min','Minutos por sesión']],c:v=>v.ses*50*(v.min>0?Math.max(v.min,10):0)/60},
{g:'Transacciones',t:'Rutas simples',r:'0,005 créditos por ruta',f:[['n','Rutas']],c:v=>v.n*0.005},
{g:'Transacciones',t:'Rutas optimizadas',r:'0,5 créditos por ruta',f:[['n','Rutas']],c:v=>v.n*0.5},
{g:'Transacciones',t:'Mapas demográficos y capas',r:'10 créditos por 1.000 solicitudes de mapa',f:[['n','Solicitudes']],c:v=>v.n/1000*10},
{g:'Transacciones',t:'Infografías',r:'10 créditos por 1.000 vistas y 10 por exportación',f:[['vis','Visualizaciones'],['exp','Exportaciones']],c:v=>v.vis/1000*10+v.exp*10},
{g:'Transacciones',t:'Generación de teselas',r:'1 crédito por 10.000 teselas',f:[['n','Teselas']],c:v=>v.n/10000},
{g:'Transacciones',t:'Capas 3D a partir de entidades',r:'1 crédito por 1.000 texturadas; 1 por 5.000 no texturadas o de punto',f:[['tex','Multiparche texturadas'],['not','No texturadas o de punto']],c:v=>v.tex/1000+v.not/5000},
{g:'Transacciones',t:'ArcGIS Notebooks: flujos interactivos',r:'3 (Advanced) o 30 (GPU) créditos por hora, mínimo 10 minutos',f:[['rt','Tiempo de ejecución',3,[[3,'Advanced · 3 cr/h'],[30,'Advanced con GPU · 30 cr/h']]],['ses','Sesiones'],['min','Minutos por sesión']],c:v=>v.rt*v.ses*(v.min>0?Math.max(v.min,10):0)/60,n:MIN30},
{g:'Transacciones',t:'ArcGIS Notebooks: flujos automatizados',r:'1,5 / 4,5 / 45 créditos por hora, calculado por minuto',f:[['rt','Tiempo de ejecución',1.5,[[1.5,'Standard · 1,5 cr/h'],[4.5,'Advanced · 4,5 cr/h'],[45,'Advanced con GPU · 45 cr/h']]],['n','Ejecuciones'],['min','Minutos por ejecución']],c:v=>v.rt*v.n*v.min/60,n:MIN30}
];
