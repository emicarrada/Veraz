import { describe, expect, it } from "vitest";

import { isNewsOutlet, isNewsReportUrl } from "@/features/news/utils/news-report";

describe("isNewsReportUrl", () => {
  it("keeps news desks", () => {
    expect(
      isNewsReportUrl(
        "https://www.eleconomista.com.mx/empresas/shein-pagara-20261124-845604.html",
      ),
    ).toBe(true);
    expect(
      isNewsReportUrl("https://www.reforma.com/sale-ines-gomez-mont-de-eu/ar3320837"),
    ).toBe(true);
    expect(
      isNewsReportUrl("https://feeds.bbci.co.uk/sport/football/articles/cj3vgdp2edpxo"),
    ).toBe(true);
  });

  it("drops opinion, lifestyle, culture features and sponsored pieces", () => {
    expect(
      isNewsReportUrl("https://www.eleconomista.com.mx/opinion/imss-bienestar.html"),
    ).toBe(false);
    expect(
      isNewsReportUrl(
        "https://www.eleconomista.com.mx/arteseideas/lana-corujo-presenta.html",
      ),
    ).toBe(false);
    expect(
      isNewsReportUrl("https://www.lanacion.com.ar/lifestyle/por-que-un-vaso-nid1/"),
    ).toBe(false);
    expect(
      isNewsReportUrl("https://www.lanacion.com.ar/recetas/torre-de-panqueques-nid1/"),
    ).toBe(false);
    expect(
      isNewsReportUrl("https://www.xataka.com.mx/territorio-samsung-mexico/galaxy"),
    ).toBe(false);
    expect(isNewsReportUrl("https://www.xataka.com.mx/seleccion/airalo-oferta")).toBe(
      false,
    );
    expect(isNewsReportUrl("https://www.espn.com/espn/feature/story/_/id/1")).toBe(
      false,
    );
  });

  it("keeps news outlets and drops culture magazines", () => {
    expect(isNewsOutlet("el-economista")).toBe(true);
    expect(isNewsOutlet("bbc-mundo")).toBe(true);
    expect(isNewsOutlet("chilango")).toBe(false);
    expect(isNewsOutlet("sopitas")).toBe(false);
    expect(isNewsOutlet("reforma-cultura")).toBe(false);
  });
});
