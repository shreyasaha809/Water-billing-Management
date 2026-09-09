import { useEffect } from "react";
const LANGUAGES = "af,sq,am,ar,hy,as,ay,az,bm,eu,be,bn,bho,bs,bg,ca,ceb,ny,zh-CN,zh-TW,co,hr,cs,da,dv,doi,nl,en,eo,et,ee,tl,fi,fr,fy,gl,ka,de,el,gn,gu,ht,ha,haw,iw,hi,hmn,hu,is,ig,ilo,id,ga,it,ja,jw,kn,kk,km,rw,gom,ko,kri,ku,ckb,ky,lo,la,lv,ln,lt,lg,lb,mk,mai,mg,ms,ml,mt,mi,mr,mni-Mtei,lus,mn,my,ne,no,or,om,ps,fa,pl,pt,pa,qu,ro,ru,sm,sa,gd,nso,sr,st,sn,sd,si,sk,sl,so,es,su,sw,sv,tg,ta,tt,te,th,ti,ts,tr,tk,ak,uk,ur,ug,uz,vi,cy,xh,yi,yo,zu";
export default function GoogleTranslate() {
  useEffect(() => {
    // Guard against StrictMode's double-invoke AND multiple mounts of this component
    // using a flag on window itself, not a component-local ref — this survives
    // the mount/cleanup/mount cycle React 18 dev mode performs.
    if (window.__googleTranslateLoaded) return;
    window.__googleTranslateLoaded = true;

  window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: LANGUAGES,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      } catch (err) {
        console.error("TranslateElement construction failed:", err);
      }
    };

    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    // Intentionally NOT deleting window.googleTranslateElementInit here —
    // that's exactly what breaks this widget under React 18 StrictMode.
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{
        position: "absolute", top: -9999, left: -9999,
        width: 1, height: 1, overflow: "hidden",
      }}
    />
  );
}