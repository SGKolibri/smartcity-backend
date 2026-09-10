-- CreateEnum
CREATE TYPE "StatusPoste" AS ENUM ('NORMAL', 'CONSUMO_ALTO', 'FALHA_OFFLINE', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "TipoEventoSensor" AS ENUM ('VEICULO_DETECTADO', 'RETORNO_AO_PISO');

-- CreateEnum
CREATE TYPE "SentidoVeiculo" AS ENUM ('APROXIMANDO', 'AFASTANDO');

-- CreateEnum
CREATE TYPE "PeriodoAgregado" AS ENUM ('DIA', 'SEMANA', 'MES', 'ANO');

-- CreateTable
CREATE TABLE "postes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "cidade" TEXT NOT NULL DEFAULT 'Itaguari',
    "uf" TEXT NOT NULL DEFAULT 'GO',
    "status" "StatusPoste" NOT NULL DEFAULT 'NORMAL',
    "luminosidadeAtual" INTEGER NOT NULL DEFAULT 50,
    "consumoInstantaneoKw" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ultimaLeituraEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leituras_telemetria" (
    "id" TEXT NOT NULL,
    "posteId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumoKw" DOUBLE PRECISION NOT NULL,
    "luminosidadePct" INTEGER NOT NULL,

    CONSTRAINT "leituras_telemetria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_sensor" (
    "id" TEXT NOT NULL,
    "posteId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoEventoSensor" NOT NULL,
    "sentido" "SentidoVeiculo",
    "luminosidadeResultante" INTEGER NOT NULL,

    CONSTRAINT "eventos_sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agregados_consumo" (
    "id" TEXT NOT NULL,
    "posteId" TEXT,
    "periodo" "PeriodoAgregado" NOT NULL,
    "periodoInicio" TIMESTAMP(3) NOT NULL,
    "periodoFim" TIMESTAMP(3) NOT NULL,
    "consumoTotalKwh" DOUBLE PRECISION NOT NULL,
    "custoTotalReais" DOUBLE PRECISION NOT NULL,
    "calculadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agregados_consumo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "postes_codigo_key" ON "postes"("codigo");

-- CreateIndex
CREATE INDEX "postes_status_idx" ON "postes"("status");

-- CreateIndex
CREATE INDEX "postes_bairro_idx" ON "postes"("bairro");

-- CreateIndex
CREATE INDEX "leituras_telemetria_posteId_timestamp_idx" ON "leituras_telemetria"("posteId", "timestamp");

-- CreateIndex
CREATE INDEX "eventos_sensor_posteId_timestamp_idx" ON "eventos_sensor"("posteId", "timestamp");

-- CreateIndex
CREATE INDEX "agregados_consumo_periodo_periodoInicio_idx" ON "agregados_consumo"("periodo", "periodoInicio");

-- CreateIndex
CREATE UNIQUE INDEX "agregados_consumo_posteId_periodo_periodoInicio_key" ON "agregados_consumo"("posteId", "periodo", "periodoInicio");

-- AddForeignKey
ALTER TABLE "leituras_telemetria" ADD CONSTRAINT "leituras_telemetria_posteId_fkey" FOREIGN KEY ("posteId") REFERENCES "postes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_sensor" ADD CONSTRAINT "eventos_sensor_posteId_fkey" FOREIGN KEY ("posteId") REFERENCES "postes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agregados_consumo" ADD CONSTRAINT "agregados_consumo_posteId_fkey" FOREIGN KEY ("posteId") REFERENCES "postes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
