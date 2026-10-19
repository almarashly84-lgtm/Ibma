import type { Language } from '../types';

// Default privacy policy. Editable from the dashboard (tab: سياسة الخصوصية).
// Format: plain text; a line starting with "## " is a heading; blank line = new paragraph; "- " = list item.
export const PRIVACY_UPDATED = '2026-10-19';

export const PRIVACY_DEFAULT: Record<Language, string> = {
  en: `## Who we are
IBMA Accounting Ltd, 30 Concourse Gate Unit 102, Nepean, ON K2E 7V7, Canada. Questions about privacy can be sent to our privacy contact at info@ibmaaccounting.ca or +1 (613) 880-0300.

## What we collect
- Appointment requests: your name, phone number and/or email, the service you choose, your preferred date and time, and any notes you write.
- Offers and news: your name, email, preferred language, and the date and wording of the consent you gave.
- Website statistics: daily totals of page views and button clicks (for example WhatsApp or call). These totals contain no names, no email addresses and no cookies.
- Abuse protection: your IP address is converted into a scrambled code (hash) to limit repeated submissions. The code cannot be read back as your address and is deleted automatically within 48 hours.
- Your language choice is saved only in your own browser.

Please do not enter your Social Insurance Number (SIN), banking details or other sensitive tax information in the website forms.

## Why we use it
- To answer and organise your appointment request.
- To send you offers and news by email, only if you ticked the consent box.
- To keep the website secure and to understand which pages are useful.

We do not sell or rent your personal information.

## Consent and unsubscribing
Subscribing to offers is optional. Every email we send includes an unsubscribe link, and you can also withdraw your consent at any time by contacting us. After you unsubscribe we keep only your email address and the date, so that we do not contact you again.

## Service providers and storage location
- Cloudflare hosts this website and its database. Cloudflare may process data on servers outside Canada, including in the United States, where it may be subject to local laws.
- If you choose to send your request through WhatsApp, the message is handled by WhatsApp (Meta) under its own privacy policy.
- The Google map is loaded only if you press the "Show map"/"Get directions" buttons; Google then receives your visit under its own privacy policy.

## How long we keep it
- Appointment requests: deleted at the latest 24 months after they are received, or earlier on request.
- Subscriber details: kept until you unsubscribe (then as described above).
- Statistics: kept as anonymous daily totals.

## Your rights
You may ask to see, correct or delete the personal information we hold about you, and you may withdraw your consent. Contact us at info@ibmaaccounting.ca. If you are not satisfied with our answer, you may contact the Office of the Privacy Commissioner of Canada (www.priv.gc.ca).

## Security
Access to the stored information is limited to the office through a password-protected dashboard. Data is sent over encrypted connections (HTTPS).

## Changes
We may update this policy. The date of the latest version is shown at the top of this page.`,

  fr: `## Qui sommes-nous
IBMA Accounting Ltd, 30 Concourse Gate Unit 102, Nepean (Ontario) K2E 7V7, Canada. Pour toute question sur la protection des renseignements personnels, écrivez à info@ibmaaccounting.ca ou appelez le +1 (613) 880-0300.

## Renseignements recueillis
- Demandes de rendez-vous : votre nom, votre numéro de téléphone ou votre courriel, le service choisi, la date et l’heure souhaitées et vos notes.
- Offres et nouvelles : votre nom, votre courriel, votre langue préférée ainsi que la date et le libellé du consentement donné.
- Statistiques du site : des totaux quotidiens de pages vues et de clics (par exemple WhatsApp ou appel). Ces totaux ne contiennent ni nom, ni courriel, ni témoin (cookie).
- Protection contre les abus : votre adresse IP est transformée en code brouillé (hachage) afin de limiter les envois répétés. Ce code ne permet pas de retrouver votre adresse et il est supprimé automatiquement dans un délai de 48 heures.
- Votre choix de langue est enregistré uniquement dans votre propre navigateur.

N’indiquez pas votre numéro d’assurance sociale (NAS), vos coordonnées bancaires ni d’autres renseignements fiscaux sensibles dans les formulaires du site.

## Utilisation
- Répondre à votre demande de rendez-vous et l’organiser.
- Vous envoyer des offres et des nouvelles par courriel, seulement si vous avez coché la case de consentement.
- Assurer la sécurité du site et savoir quelles pages sont utiles.

Nous ne vendons ni ne louons vos renseignements personnels.

## Consentement et désabonnement
L’abonnement aux offres est facultatif. Chaque courriel contient un lien de désabonnement, et vous pouvez retirer votre consentement en tout temps en nous contactant. Après le désabonnement, nous conservons uniquement votre courriel et la date, afin de ne plus vous écrire.

## Fournisseurs et lieu de stockage
- Cloudflare héberge ce site et sa base de données. Cloudflare peut traiter les données sur des serveurs situés hors du Canada, notamment aux États-Unis, où elles peuvent être soumises aux lois locales.
- Si vous choisissez d’envoyer votre demande par WhatsApp, le message est traité par WhatsApp (Meta) selon sa propre politique.
- La carte Google n’est chargée que si vous appuyez sur « Afficher la carte » ou « Itinéraire »; Google reçoit alors votre visite selon sa propre politique.

## Durée de conservation
- Demandes de rendez-vous : supprimées au plus tard 24 mois après leur réception, ou plus tôt sur demande.
- Abonnés : conservés jusqu’au désabonnement (puis comme décrit ci-dessus).
- Statistiques : conservées sous forme de totaux quotidiens anonymes.

## Vos droits
Vous pouvez demander à consulter, corriger ou supprimer vos renseignements personnels et retirer votre consentement en écrivant à info@ibmaaccounting.ca. Si notre réponse ne vous satisfait pas, vous pouvez vous adresser au Commissariat à la protection de la vie privée du Canada (www.priv.gc.ca).

## Sécurité
L’accès aux renseignements enregistrés est réservé au bureau au moyen d’un tableau de bord protégé par mot de passe. Les données circulent par des connexions chiffrées (HTTPS).

## Modifications
Cette politique peut être mise à jour. La date de la dernière version figure en haut de cette page.`,

  ar: `## من نحن
IBMA Accounting Ltd، العنوان: 30 Concourse Gate Unit 102, Nepean, ON K2E 7V7, Canada. لأي سؤال عن الخصوصية راسلنا على info@ibmaaccounting.ca أو اتصل على ‎+1 (613) 880-0300.

## البيانات التي نجمعها
- طلبات المواعيد: الاسم، ورقم الهاتف و/أو البريد الإلكتروني، والخدمة المختارة، والتاريخ والوقت المفضلان، وأي ملاحظات تكتبها.
- العروض والأخبار: الاسم، والبريد الإلكتروني، واللغة المفضلة، وتاريخ موافقتك ونصها.
- إحصائيات الموقع: مجاميع يومية لعدد مرات فتح الصفحات والضغط على الأزرار (مثل واتساب أو الاتصال). لا تحتوي هذه المجاميع على أسماء أو عناوين بريد، ولا نستخدم ملفات تعريف الارتباط (Cookies).
- الحماية من الإساءة: يُحوَّل عنوان IP الخاص بك إلى رمز مشفّر لا يمكن إرجاعه إلى العنوان، ويُستخدم للحد من الإرسال المتكرر، ويُحذف تلقائيًا خلال 48 ساعة.
- تُحفظ اللغة التي تختارها في متصفحك أنت فقط.

يرجى عدم إدخال رقم التأمين الاجتماعي (SIN) أو البيانات البنكية أو أي معلومات ضريبية حساسة في نماذج الموقع.

## لماذا نستخدمها
- للرد على طلب موعدك وتنظيمه.
- لإرسال العروض والأخبار إلى بريدك الإلكتروني، فقط إذا وافقت على ذلك بوضع علامة في مربع الموافقة.
- لحماية الموقع ومعرفة الصفحات المفيدة للزوار.

لا نبيع بياناتك الشخصية ولا نؤجرها.

## الموافقة وإلغاء الاشتراك
الاشتراك في العروض اختياري. كل رسالة نرسلها تحتوي على رابط لإلغاء الاشتراك، ويمكنك سحب موافقتك في أي وقت بالتواصل معنا. بعد إلغاء الاشتراك نحتفظ فقط ببريدك الإلكتروني وتاريخ الإلغاء، حتى لا نراسلك مرة أخرى.

## مزودو الخدمة ومكان التخزين
- يستضيف Cloudflare هذا الموقع وقاعدة بياناته، وقد يعالج البيانات على خوادم خارج كندا، منها الولايات المتحدة، حيث قد تخضع لقوانينها.
- إذا اخترت إرسال طلبك عبر واتساب، فإن الرسالة تخضع لسياسة الخصوصية الخاصة بواتساب (Meta).
- لا تُحمَّل خريطة Google إلا إذا ضغطت على زر «عرض الخريطة» أو «الاتجاهات»، وعندها تصل زيارتك إلى Google وفق سياستها.

## مدة الاحتفاظ بالبيانات
- طلبات المواعيد: تُحذف خلال 24 شهرًا كحد أقصى من تاريخ استلامها، أو قبل ذلك عند الطلب.
- بيانات المشتركين: تُحفظ حتى إلغاء الاشتراك (ثم كما هو موضح أعلاه).
- الإحصائيات: تُحفظ كمجاميع يومية مجهولة الهوية.

## حقوقك
يحق لك طلب الاطلاع على بياناتك الشخصية لدينا أو تصحيحها أو حذفها، وسحب موافقتك، وذلك بمراسلتنا على info@ibmaaccounting.ca. وإن لم يُرضِك ردنا، يمكنك التواصل مع مكتب مفوض الخصوصية في كندا (www.priv.gc.ca).

## الأمان
الوصول إلى البيانات المحفوظة مقتصر على المكتب عبر لوحة تحكم محمية بكلمة سر، وتنتقل البيانات عبر اتصال مشفّر (HTTPS).

## التعديلات
قد نحدّث هذه السياسة، ويظهر تاريخ آخر نسخة في أعلى هذه الصفحة.`,
};
