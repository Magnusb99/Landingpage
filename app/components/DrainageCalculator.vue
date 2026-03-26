<template>
  <div class="min-h-screen bg-neutral-100">

    <!-- ── Toolbar ───────────────────────────────────────────────────────── -->
    <div class="sticky top-0 z-20 bg-white border-b border-neutral-200 px-5 py-3 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-3">
        <h1
          class="text-lg font-bold text-neutral-800"
          style="font-family: 'Space Grotesk', sans-serif;"
        >
          Dräneringsoffert
        </h1>
        <!-- Snabb-exempelväljare -->
        <select
          class="text-xs border border-neutral-200 rounded px-2 py-1.5 text-neutral-600 bg-white focus:outline-none focus:border-slateSecondary-500"
          @change="loadExample($event.target.value)"
        >
          <option value="">Ladda testexempel…</option>
          <option v-for="ex in EXAMPLE_INPUTS" :key="ex.id" :value="ex.id">
            {{ ex.label }}
          </option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <!-- Varning om offerten är inaktuell -->
        <span
          v-if="isStale"
          class="text-xs text-slateWarning-600 font-medium bg-slateWarning-50 border border-slateWarning-200 px-2 py-1 rounded"
        >
          Parametrar ändrade – klicka Beräkna för att uppdatera
        </span>
        <button
          class="text-sm font-medium px-4 py-1.5 rounded border transition-colors"
          :class="isStale
            ? 'bg-slateSecondary-800 text-white border-slateSecondary-800 hover:bg-slateSecondary-700'
            : 'bg-white text-neutral-600 border-neutral-600 hover:bg-neutral-50'"
          @click="recalculate"
        >
          Beräkna offert
        </button>
        <button
          class="text-sm font-medium px-4 py-1.5 rounded border border-slatePrimary-500 bg-slatePrimary-500 text-white hover:bg-slatePrimary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          :disabled="quoteRows.length === 0 || isSending"
          @click="handleSendQuote"
        >
          <span v-if="isSending">Skickar…</span>
          <span v-else>✉ Skicka offert</span>
        </button>
      </div>
    </div>

    <!-- ── Skicka-bekräftelse ─────────────────────────────────────────────── -->
    <div
      v-if="sendResult"
      class="mx-4 mt-3 px-4 py-2 rounded text-sm border"
      :class="sendResult.success
        ? 'bg-slateSuccess-50 border-slateSuccess-200 text-slateSuccess-700'
        : 'bg-slateError-50 border-slateError-200 text-slateError-700'"
    >
      {{ sendResult.message }}
      <button class="ml-3 underline text-xs" @click="sendResult = null">Stäng</button>
    </div>

    <!-- ── Tvåpanel-layout ────────────────────────────────────────────────── -->
    <div class="flex" style="height: calc(100vh - 53px);">

      <!-- ─ VÄNSTER: Parametrar ─────────────────────────────────────────── -->
      <div class="w-[380px] shrink-0 overflow-y-auto border-r border-neutral-200 bg-neutral-50 p-4 space-y-4">

        <!-- Beräkningsparametrar -->
        <section class="bg-white rounded-lg border border-neutral-200 p-4">
          <h2 class="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Schaktparametrar
          </h2>
          <div class="space-y-3">

            <!-- Djup -->
            <div>
              <label class="text-xs text-neutral-600 block mb-1">
                Djup (m) <span class="text-neutral-600">— kalkylbladets A4</span>
              </label>
              <input
                v-model.number="inputParams.depth"
                type="number"
                min="0.5"
                max="5"
                step="0.1"
                placeholder="t.ex. 2.2"
                class="w-full border border-neutral-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-slateSecondary-500"
                @input="markStale"
              />
            </div>

            <!-- Längd -->
            <div>
              <label class="text-xs text-neutral-600 block mb-1">
                Längd (m) <span class="text-neutral-600">— kalkylbladets B4</span>
              </label>
              <input
                v-model.number="inputParams.length"
                type="number"
                min="1"
                max="500"
                step="1"
                placeholder="t.ex. 35"
                class="w-full border border-neutral-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-slateSecondary-500"
                @input="markStale"
              />
            </div>

            <!-- Brunnstyp -->
            <div>
              <label class="text-xs text-neutral-600 block mb-1">Typ av brunn</label>
              <select
                v-model="inputParams.wellType"
                class="w-full border border-neutral-200 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-slateSecondary-500"
                @change="markStale"
              >
                <option v-for="wt in WELL_TYPES" :key="wt.value" :value="wt.value">
                  {{ wt.label }}
                </option>
              </select>
            </div>

            <!-- Bortforsling (L4) -->
            <div class="pt-1">
              <label class="text-xs text-neutral-600 block mb-2">
                Bortforsling av schaktmassor
                <span class="text-neutral-600">— kalkylbladets L4</span>
              </label>
              <div class="flex gap-3">
                <label
                  class="flex-1 flex items-center justify-center gap-2 border rounded px-3 py-2 cursor-pointer text-sm transition-colors select-none"
                  :class="inputParams.removeExcavatedMass
                    ? 'border-slateSecondary-600 bg-slateSecondary-50 text-slateSecondary-800 font-medium'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-600'"
                >
                  <input type="radio" :value="true"  v-model="inputParams.removeExcavatedMass" class="sr-only" @change="markStale" />
                  ✓ Ja, forsla bort
                </label>
                <label
                  class="flex-1 flex items-center justify-center gap-2 border rounded px-3 py-2 cursor-pointer text-sm transition-colors select-none"
                  :class="!inputParams.removeExcavatedMass
                    ? 'border-slateSecondary-600 bg-slateSecondary-50 text-slateSecondary-800 font-medium'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-600'"
                >
                  <input type="radio" :value="false" v-model="inputParams.removeExcavatedMass" class="sr-only" @change="markStale" />
                  ✗ Behåll massor
                </label>
              </div>
              <p class="text-xs text-neutral-600 mt-1.5">
                Vid NEJ sätts containerkostnad till 0 men raderna syns i editorn för manuell aktivering.
              </p>
            </div>

          </div>
        </section>

        <!-- Förhandsvisning av kalkyl -->
        <section v-if="quoteRows.length > 0" class="bg-white rounded-lg border border-neutral-200 p-4">
          <h2 class="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Preliminär totalsumma
          </h2>
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between text-neutral-600">
              <span>Exkl. moms</span>
              <span class="tabular-nums font-medium">{{ formatCurrency(liveTotal.subtotalExVat) }} kr</span>
            </div>
            <div class="flex justify-between text-neutral-600">
              <span>Moms (25 %)</span>
              <span class="tabular-nums font-medium">{{ formatCurrency(liveTotal.vat) }} kr</span>
            </div>
            <div class="flex justify-between font-bold border-t border-neutral-200 pt-2 mt-1">
              <span>Inkl. moms</span>
              <span class="tabular-nums">{{ formatCurrency(liveTotal.totalIncVat) }} kr</span>
            </div>
          </div>
        </section>

        <!-- Kontaktuppgifter -->
        <section class="bg-white rounded-lg border border-neutral-200 p-4">
          <h2 class="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Kontaktuppgifter
          </h2>
          <div class="space-y-2">
            <div>
              <label class="text-xs text-neutral-600 block mb-1">Namn</label>
              <input v-model="contact.name" placeholder="För- och efternamn" class="w-full border border-neutral-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-slateSecondary-500" />
            </div>
            <div>
              <label class="text-xs text-neutral-600 block mb-1">E-postadress</label>
              <input v-model="contact.email" type="email" placeholder="kund@example.se" class="w-full border border-neutral-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-slateSecondary-500" />
            </div>
            <div>
              <label class="text-xs text-neutral-600 block mb-1">Telefon</label>
              <input v-model="contact.phone" type="tel" placeholder="070-000 00 00" class="w-full border border-neutral-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-slateSecondary-500" />
            </div>
            <div>
              <label class="text-xs text-neutral-600 block mb-1">Adress</label>
              <input v-model="contact.address" placeholder="Gatuadress, ort" class="w-full border border-neutral-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-slateSecondary-500" />
            </div>
          </div>
        </section>

        <!-- Entreprenörens anteckningar -->
        <section class="bg-white rounded-lg border border-neutral-200 p-4">
          <h2 class="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Interna anteckningar
          </h2>
          <textarea
            v-model="notes"
            rows="4"
            placeholder="Egna parametrar, avvikelser, fria noteringar om projektet…"
            class="w-full border border-neutral-200 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-slateSecondary-500 text-neutral-700 placeholder-neutral-600"
          />
          <p class="text-xs text-neutral-600 mt-1">Syns ej i offerten som skickas till kund.</p>
        </section>

      </div><!-- end vänster -->

      <!-- ─ HÖGER: Offerteditor ──────────────────────────────────────────── -->
      <div class="flex-1 overflow-hidden flex flex-col">

        <!-- Tom state -->
        <div
          v-if="quoteRows.length === 0"
          class="flex-1 flex flex-col items-center justify-center text-center p-8"
        >
          <div class="text-5xl mb-4">🏗️</div>
          <h3 class="text-lg font-semibold text-neutral-600 mb-2" style="font-family: 'Space Grotesk', sans-serif;">
            Fyll i parametrar och klicka Beräkna
          </h3>
          <p class="text-sm text-neutral-600 max-w-xs">
            Ange djup och längd i vänsterpanelen, välj brunnstyp och bortforsling, sedan genereras offertraderna automatiskt.
          </p>
          <button
            class="mt-6 px-6 py-2 rounded bg-slateSecondary-800 text-white text-sm font-medium hover:bg-slateSecondary-700 transition-colors"
            @click="recalculate"
          >
            Beräkna offert nu
          </button>
        </div>

        <!-- Offerteditorn -->
        <QuoteEditor
          v-else
          :quoteRows="quoteRows"
          @addCustomRow="addCustomRow"
        />

      </div><!-- end höger -->

    </div><!-- end tvåpanel -->
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import {
  calculateQuote,
  calculateTotals,
  buildQuotePayload,
  sendQuoteMock,
  formatCurrency,
  WELL_TYPES,
  EXAMPLE_INPUTS,
  CATEGORIES,
  PRICE_LIST,
} from '~/lib/drainageCalculator.js'
import QuoteEditor from '~/components/QuoteEditor.vue'

// ── Beräkningsparametrar (vänsterpanel) ───────────────────────────────────────
const inputParams = reactive({
  depth:               2.2,
  length:              35,
  wellType:            'bada',
  removeExcavatedMass: true,
})

// ── Kontakt + anteckningar ────────────────────────────────────────────────────
const contact = reactive({ name: '', email: '', phone: '', address: '' })
const notes   = ref('')

// ── Offert-rader (reaktiv array – muteras direkt av QuoteEditor) ──────────────
// Obs: reactive([]) gör att nästlade objekt (row.qty, row.enabled etc.)
// automatiskt spåras av Vue:s reaktivitetssystem.
const quoteRows = reactive([])

// ── Liveberäknade totaler ────────────────────────────────────────────────────
// calculateTotals är ren JS; computed() spårar alla reaktiva åtkomster inuti.
const liveTotal = computed(() => calculateTotals(quoteRows))

// ── Stale-markering ──────────────────────────────────────────────────────────
// Visas som varning i toolbaren när parametrar ändrats utan ny beräkning.
const isStale = ref(false)
function markStale() { isStale.value = true }

// ── Beräkna / återberäkna ────────────────────────────────────────────────────
function recalculate() {
  const result = calculateQuote({ ...inputParams })
  // Ersätt innehållet i den reaktiva arrayen (behåll referensen)
  quoteRows.splice(0, quoteRows.length, ...result.quoteRows)
  isStale.value = false
}

// Initiera med standardvärden direkt
recalculate()

// ── Lägg till fri rad ────────────────────────────────────────────────────────
// Skapar en tom rad som entreprenören kan fylla i manuellt.
function addCustomRow() {
  quoteRows.push({
    id:        Date.now(),
    key:       'custom',
    title:     'Fri rad – fyll i beskrivning',
    qty:       1,
    unit:      'st',
    unitPrice: 0,
    enabled:   true,
    editable:  true,
    category:  CATEGORIES.ETABLERING, // placeras längst upp tills vidare
  })
}

// ── Ladda testexempel ────────────────────────────────────────────────────────
function loadExample(exId) {
  if (!exId) return
  const ex = EXAMPLE_INPUTS.find(e => e.id === exId)
  if (!ex) return
  Object.assign(inputParams, ex.input)
  recalculate()
}

// ── Skicka offert (mockad) ────────────────────────────────────────────────────
const isSending  = ref(false)
const sendResult = ref(null)

async function handleSendQuote() {
  isSending.value  = true
  sendResult.value = null

  const payload = buildQuotePayload({
    input:     { ...inputParams },
    quoteRows: quoteRows.filter(r => r.enabled),
    totals:    liveTotal.value,
    contact:   { ...contact },
    notes:     notes.value,
  })

  try {
    const result = await sendQuoteMock(payload)
    sendResult.value = result
  } catch (err) {
    sendResult.value = { success: false, message: 'Något gick fel vid utskick.' }
  } finally {
    isSending.value = false
  }
}
</script>

<style scoped></style>
