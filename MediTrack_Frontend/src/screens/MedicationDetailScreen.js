import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image, LayoutAnimation, UIManager, Platform,} from "react-native";
import { useParams, Link } from "react-router-dom";
import { getMedicationDetails } from "../api/auth";
import { FontAwesome5 } from "@expo/vector-icons";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MedicationDetailsScreen() {
  const { itemId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({
    substitutes: true,
    packages: true,
  });

  // Ezek a mezők még placeholderrel mennek egyelőre:
  const extraDetails = [
    ["Normatív TB támogatás", "—"],
    ["Közgyógyellátásra adható", "—"],
    ["EÜ támogatásra adható", "—"],
    ["Üzemi baleset jogcím", "—"],
  ];


  const fetchDetails = useCallback(async () => {
    try {
      const result = await getMedicationDetails(itemId);
      setData(result);
    } catch (e) {
      console.error("Hiba a részletek betöltésekor:", e);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (!data) {
    return <Text style={styles.errorText}>Nem található adat.</Text>;
  }

  const docs = [
    { icon: "file-alt", label: "Betegtájékoztató", url: data.patientInfoUrl },
    { icon: "file-medical", label: "Alkalmazási előírás", url: data.smpcUrl },
    { icon: "file-signature", label: "Címkeszöveg", url: data.labelUrl },
  ].filter((d) => d.url);

  const sections = [
    {
      key: "substitutes",
      title: "Helyettesítő készítmények",
      content: (data.substitutes || []).map((item, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => (window.location.href = `/medication/${item.itemId}`)}
        >
          <Text style={[styles.itemText, { textDecorationLine: "underline" }]}>
            {item.name} ({item.registrationNumber})
          </Text>
        </TouchableOpacity>
      )),
    },    
    {
      key: "packages",
      title: "Kiszerelések",
      content: (data.packages || []).map((item, i) => (
        <Text key={i} style={styles.itemText}>
          {item.name} – {item.registrationNumber}
        </Text>
      )),
    },
    {
      key: "hazipatika",
      title: "Betegtájékoztató",
      content: data.hazipatikaInfo
        ? [
            data.hazipatikaInfo.section1,
            data.hazipatikaInfo.section2,
            data.hazipatikaInfo.section3,
            data.hazipatikaInfo.section4,
            data.hazipatikaInfo.section5,
            data.hazipatikaInfo.section6,
          ]
            .filter(Boolean)
            .map((text, i) => (
              <Text key={i} style={styles.itemText}>
                {text.replace(/<br\s*\/?>/gi, "\n")}
              </Text>
            ))
        : [],
    },
    {
      key: "finalSamples",
      title: "Véglegminta engedélyek",
      content: (data.finalSamples || []).map((item, i) => (
        <Text key={i} style={styles.itemText}>
          {item.packageDescription} – {item.decisionDate}
        </Text>
      )),
    },
    {
      key: "defectiveForms",
      title: "Alaki hiba engedélyek",
      content: (data.defectiveForms || []).map((item, i) => (
        <Text key={i} style={styles.itemText}>
          {item.packageDescription} – {item.condition}
        </Text>
      )),
    },
    {
      key: "reviews",
      title: "Értékelések és vélemények",
      content: [<Text key="placeholder" style={styles.itemText}>Review rész – ide majd jönnek az értékelések</Text>],
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>{data.name}</Text>

        <View style={styles.topSection}>
          <View style={styles.imageBlock}>
            {data.imageUrl && (
              <Image source={{ uri: data.imageUrl }} style={styles.image} />
            )}
            <View style={styles.iconRow}>
              {docs.map((doc, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.iconButton}
                  onPress={() => window.open(doc.url, "_blank")}
                >
                  <FontAwesome5 name={doc.icon} size={22} color="black" />
                  <Text style={styles.iconLabel}>{doc.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.infoBlock}>
            <View style={styles.booleanRow}>
              <BooleanField label="Laktóz" value={data.containsLactose} />
              <BooleanField label="Búzakeményítő" value={data.containsStarch} />
              <BooleanField label="Benzoát" value={data.containsBenzoate} />
            </View>

            <View style={styles.detailsBlockBottom}>
              <Detail label="Kábítószer" value={data.narcotic} />
              <Detail label="Normatív TB támogatás" value={data.hazipatikaInfo?.normativeTbSupport ? "✓" : "✕"} />
              <Detail label="Vényköteles" value={data.hazipatikaInfo?.prescriptionRequired ? "✓" : "✕"} />
              <Detail label="Közgyógyellátásra adható" value={data.hazipatikaInfo?.publicHealthSupport ? "✓" : "✕"} />
              <Detail label="Patikán kívül vásárolható" value={data.hazipatikaInfo?.outsidePharmacy ? "✓" : "✕"} />
              <Detail label="EÜ támogatásra adható" value={data.hazipatikaInfo?.euSupportable ? "✓" : "✕"} />
              <Detail label="EÜ Kiemelt támogatás" value={data.hazipatikaInfo?.euPrioritySupport ? "✓" : "✕"} />
              <Detail label="Üzemi baleset jogcím" value={data.hazipatikaInfo?.accidentCoverage ? "✓" : "✕"} />
            </View>

            <View style={styles.detailsBlockTop}>
              <Detail label="Forgalomba hozatali engedély jogosultja" value={data.company} />
              <Detail label="Engedélyezés dátuma" value={data.authorizationDate} />
              <Detail label="Nyilvántartási szám" value={data.registrationNumber} />
              <Detail label="Hatóanyag" value={data.substance} />
              <Detail label="ATC kód" value={data.atcCode} />
              <Detail label="Gyártó" value={data.company} />
              <Detail label="Jogalap" value={data.legalBasis} />
              <Detail label="Státusz" value={data.status} />
            </View>
            
          </View>
        </View>

        {/* 1. Helyettesítő készítmények */}
        <View style={styles.accordion}>
          <TouchableOpacity onPress={() => toggleSection("substitutes")} style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>Helyettesítő készítmények</Text>
            <Text>{openSections["substitutes"] ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {openSections["substitutes"] && (
            <View style={styles.accordionBody}>
              {(data.substitutes || []).map((item, i) => (
                <Link
                  key={i}
                  to={`/medication/${item.itemId}`}
                  style={styles.linkText}
                >
                  {item.name} ({item.registrationNumber})
                </Link>
              ))}
            </View>
          )}
        </View>

        {/* 2. Kiszerelések */}
        <View style={styles.accordion}>
          <TouchableOpacity onPress={() => toggleSection("packages")} style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>Kiszerelések</Text>
            <Text>{openSections["packages"] ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {openSections["packages"] && (
            <View style={styles.accordionBody}>
              {(data.packages || []).map((item, i) => (
                <Text key={i} style={styles.itemText}>
                  {item.name} – {item.registrationNumber}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* 3. Lehetséges mellékhatások */}
        <View style={styles.accordion}>
          <TouchableOpacity onPress={() => toggleSection("hazipatika4")} style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>Lehetséges mellékhatások</Text>
            <Text>{openSections["hazipatika4"] ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {openSections["hazipatika4"] && (
            <View style={styles.accordionBody}>
              <Text style={styles.itemText}>{data.hazipatikaInfo?.section4?.replace(/<br\s*\/?>/gi, "\n")}</Text>
            </View>
          )}
        </View>

        {/* 4. Hogyan kell szedni az Algoflex Duo-t? */}
        <View style={styles.accordion}>
          <TouchableOpacity onPress={() => toggleSection("hazipatika3")} style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>Hogyan kell szedni az Algoflex Duo-t?</Text>
            <Text>{openSections["hazipatika3"] ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {openSections["hazipatika3"] && (
            <View style={styles.accordionBody}>
              <Text style={styles.itemText}>{data.hazipatikaInfo?.section3?.replace(/<br\s*\/?>/gi, "\n")}</Text>
            </View>
          )}
        </View>

        {/* 5. Betegtájékoztató */}
        <View style={styles.accordion}>
          <TouchableOpacity onPress={() => toggleSection("hazipatika")} style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>Betegtájékoztató</Text>
            <Text>{openSections["hazipatika"] ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {openSections["hazipatika"] && (
            <View style={styles.accordionBody}>
              {[1,2,5,6].map(n => {
                const text = data.hazipatikaInfo?.[`section${n}`];
                return text ? <Text key={n} style={styles.itemText}>{text.replace(/<br\s*\/?>/gi, "\n")}</Text> : null;
              })}
            </View>
          )}
        </View>

        {/* 6. Mellékhatások Bejelentése */}
        <View style={styles.accordion}>
          <TouchableOpacity onPress={() => toggleSection("finalSamples")} style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>Mellékhatások Bejelentése</Text>
            <Text>{openSections["finalSamples"] ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {openSections["finalSamples"] && (
            <View style={styles.accordionBody}>
              {(data.finalSamples || []).map((item, i) => (
                <Text key={i} style={styles.itemText}>
                  {item.packageDescription} – {item.decisionDate}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* 7. Értékelése és Vélemények */}
        <View style={styles.accordion}>
          <TouchableOpacity onPress={() => toggleSection("reviews")} style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>Értékelések és Vélemények</Text>
            <Text>{openSections["reviews"] ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {openSections["reviews"] && (
            <View style={styles.accordionBody}>
              <Text style={styles.itemText}>Review rész – ide majd jönnek az értékelések</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function Detail({ label, value }) {
  const isBooleanSymbol = value === "✓" || value === "✕";

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text
        style={[
          styles.detailValue,
          isBooleanSymbol && (value === "✓" ? styles.detailValueTrue : styles.detailValueFalse),
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function BooleanField({ label, value }) {
  return (
    <View style={styles.booleanField}>
      <Text style={styles.boolLabel}>{label}:</Text>
      <Text style={[styles.boolValue, value ? styles.detailValueFalse : styles.detailValueTrue]}>
        {value ? "✓" : "✕"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 1000,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    textAlign: "left",
    marginBottom: 32,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  imageBlock: {
    flex: 4,
    alignItems: "center",
    paddingRight: 16,
  },
  image: {
    width: 260,
    height: 260,
    resizeMode: "contain",
    marginBottom: 16,
    borderRadius: 10,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 20,
  },
  iconButton: {
    alignItems: "center",
    marginHorizontal: 6,
    maxWidth: 80,
  },
  iconLabel: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  infoBlock: {
    flex: 6,
    justifyContent: "flex-start",
  },
  details: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailLabel: {
    fontWeight: "600",
    width: 180,
  },
  detailValue: {
    flex: 1,
  },
  detailValueTrue: {
    color: "green",
    fontWeight: "700",
  },
  detailValueFalse: {
    color: "red",
    fontWeight: "700",
  },  
  booleanRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 36,
  },
  bool: {
    fontWeight: "600",
    fontSize: 14,
  },
  booleanField: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  boolLabel: {
    fontWeight: "600",
    fontSize: 14,
    marginRight: 4,
  },
  boolValue: {
    fontWeight: "700",
    fontSize: 16,
  },  
  detailsBlockTop: {
    flexDirection: "column",
    width: "100%",
    maxWidth: 500,
  },
  detailsBlockBottom: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    maxWidth: 500,
    width: "100%",
  },

  accordion: {
    marginBottom: 16,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#000", // fekete aláhúzás
    backgroundColor: "#fff", // ugyanaz mint az oldal háttere
  },
  accordionTitle: {
    fontSize: 18, // nagyobb betűméret
    fontWeight: "700",
    color: "#000",
  },
  accordionBody: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  itemText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 24,
  },
  linkText: {
    textDecorationLine: "underline",
    color: "black",
    marginBottom: 8,
    display: "block",
  }  
});
