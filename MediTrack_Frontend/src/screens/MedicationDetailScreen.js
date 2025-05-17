import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { useParams, Link } from "react-router-dom";
import { getMedicationDetails, getReviewsForMedication, submitReview, updateReview } from "../api/auth";
import { FontAwesome5 } from "@expo/vector-icons";
import ReviewSection from "../components/ReviewSection";
import { fetchCurrentUser } from "../api/auth";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MedicationDetailsScreen() {
  const { itemId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({
    baseInfo: false,
    substitutes: false,
    packages: false,
    sideEffects: false,
    application: false,
    fullLeaflet: false,
    finalSamples: false,
    defectiveForms: false,
    reviews: false,
  });
  const [reviews, setReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  const fetchReviews = useCallback(async () => {
    try {
      const res = await getReviewsForMedication(itemId);
      setReviews(res.reviews || []);
      setAverageRating(res.averageRating || 0);
      setRatingDistribution(res.ratingDistribution || {});
    } catch (e) {
      console.error("Hiba a review-k betöltésekor:", e);
    }
  }, [itemId]);

  useEffect(() => {
    fetchDetails();
    fetchReviews();
    fetchCurrentUser()
      .then((user) => {
        setCurrentUser(user);
      })
      .catch((e) => {
        console.error("Nem sikerült betölteni a felhasználót:", e);
    });
  }, [fetchDetails, fetchReviews]);

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

  const renderHtmlSection = (html) =>
    html ? (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="html-render"
      />
    ) : null;

  const handleUpdateReview = async (payload) => {
    setSubmitting(true);
    try {
      await updateReview(itemId, payload);
      await fetchReviews();
    } catch (e) {
      console.error("Hiba a vélemény módosításakor:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.contentWrapper}>
        {/* 1. fejléc + kép + ikonok */}
        <View style={styles.topSection}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>{data.name}</Text>
            <Text style={styles.subtitle}>
              Hatóanyag: {data.substance} • ATC: {data.atcCode}
            </Text>

            {data.imageUrl && (
              <Image 
                source={{ uri: data.imageUrl }}
                resizeMode="contain"
                style={styles.mainImage}
              />
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
        </View>

        {/* Boolean mezők */}
        <View style={styles.quickInfoSection}>
          <BooleanField label="Laktóz" value={data.containsLactose} />
          <BooleanField label="Búzakeményítő" value={data.containsGluten} />
          <BooleanField label="Benzoát" value={data.containsBenzoate} />
        </View>

        {/* Rácsos boolean mezők */}
        <View style={styles.gridSection}>
          <View style={styles.gridColumn}>
            <BooleanField label="Kábítószer" value={data.narcotic?.toLowerCase() === "igen"} />
            <BooleanField label="Vényköteles" value={data.hazipatikaInfo?.prescriptionRequired} />
            <BooleanField label="Patikán kívül vásárolható" value={data.hazipatikaInfo?.outsidePharmacy} />
            <BooleanField label="Normatív TB támogatás" value={data.hazipatikaInfo?.normativeTbSupport} />
          </View>
          <View style={styles.gridColumn}>
            <BooleanField label="Közgyógyellátás" value={data.hazipatikaInfo?.publicHealthSupport} />
            <BooleanField label="EÜ támogatás" value={data.hazipatikaInfo?.euSupportable} />
            <BooleanField label="EÜ kiemelt" value={data.hazipatikaInfo?.euPrioritySupport} />
            <BooleanField label="Üzemi baleset jogcím" value={data.hazipatikaInfo?.accidentCoverage} />
          </View>
        </View>

        {/* Alapadatok */}
        <Accordion title="Alapadatok" isOpen={openSections.baseInfo} onToggle={() => toggleSection("baseInfo")}>
          <Detail label="Hatóanyag" value={data.substance} />
          <Detail label="ATC kód" value={data.atcCode} />
          <Detail label="Forgalomba hozatali engedély jogosultja" value={data.company} />
          <Detail label="Gyártó" value={data.company} />
          <Detail label="Jogalap" value={data.legalBasis} />
          <Detail label="Státusz" value={data.status} />
          <Detail label="Engedélyezés dátuma" value={data.authorizationDate} />
          <Detail label="Nyilvántartási szám" value={data.registrationNumber} />
        </Accordion>

        {/* Accordion szekciók */}
        <Accordion title="Helyettesítő készítmények" isOpen={openSections.substitutes} onToggle={() => toggleSection("substitutes")}>
          {data.substitutes?.map((s, i) => (
            <Link key={i} to={`/medication/${s.itemId}`} className="substitute-link">
              {s.name} ({s.registrationNumber})
            </Link>
          ))}
        </Accordion>

        <Accordion title="Kiszerelések" isOpen={openSections.packages} onToggle={() => toggleSection("packages")}>
          {data.packages?.map((p, i) => (
            <div key={i} className="package-item">
              {p.name} ({p.registrationNumber})
            </div>
          ))}
        </Accordion>

        <Accordion title="Lehetséges mellékhatások" isOpen={openSections.sideEffects} onToggle={() => toggleSection("sideEffects")}>
          {renderHtmlSection(data.hazipatikaInfo?.sections?.find(s => s.heading.includes("Lehetséges mellékhatások"))?.html)}
        </Accordion>

        <Accordion title="Hogyan kell alkalmazni?" isOpen={openSections.application} onToggle={() => toggleSection("application")}>
          {renderHtmlSection(data.hazipatikaInfo?.sections?.find(s => s.heading.includes("Hogyan kell alkalmazni"))?.html)}
        </Accordion>

        <Accordion title="Teljes betegtájékoztató" isOpen={openSections.fullLeaflet} onToggle={() => toggleSection("fullLeaflet")}>
          {data.hazipatikaInfo?.sections?.map((section, i) => (
            <View key={i}>
              <Text style={{ fontWeight: "bold", marginTop: 10 }}>{section.heading}</Text>
              {renderHtmlSection(section.html)}
            </View>
          ))}
        </Accordion>

        <Accordion title="Véglegminták" isOpen={openSections.finalSamples} onToggle={() => toggleSection("finalSamples")}>
          {data.finalSamples?.map((f, i) => (
            <div key={i} className="package-item">
              {f.packageDescription} – {f.decisionDate}
            </div>
          ))}
        </Accordion>

        <Accordion title="Alaki hibák" isOpen={openSections.defectiveForms} onToggle={() => toggleSection("defectiveForms")}>
          {data.defectiveForms?.map((d, i) => (
            <div key={i} className="package-item">
              {d.packageDescription} – {d.decisionDate}
            </div>
          ))}
        </Accordion>

        {/* Vélemények szekció */}
        <ReviewSection
          reviews={reviews}
          averageRating={averageRating}
          ratingDistribution={ratingDistribution}
          submitting={submitting}
          isLoggedIn={!!currentUser}
          userId={currentUser?.id}
          onSubmit={async ({ rating, positive, negative}) => {
            if (!rating ) return;
            if (!currentUser?.id) {
              return;
            }
            
            setSubmitting(true);
            try {
              await submitReview(itemId, { rating, positive, negative, userId: currentUser.id,});
              await fetchReviews();
            } catch (e) {
              console.error("Hiba az értékelés beküldésekor:", e);
            } finally {
              setSubmitting(false);
            }
          }}
          updateReview={handleUpdateReview}
        />
      </View>
    </ScrollView>
  );
}

function BooleanField({ label, value }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 8 }}>
      <Text style={{ fontWeight: "600", marginRight: 6 }}>{label}:</Text>
      <Text style={{ fontWeight: "700", color: value ? "green" : "red" }}>{value ? "✓" : "✕"}</Text>
    </View>
  );
}

function Detail({ label, value }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 8 }}>
      <Text style={{ fontWeight: "600", width: 240 }}>{label}:</Text>
      <Text>{value}</Text>
    </View>
  );
}

function Accordion({ title, isOpen, onToggle, children }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <TouchableOpacity onPress={onToggle} style={styles.accordionHeader}>
        <Text style={styles.accordionTitle}>{title}</Text>
        <Text>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.accordionBody}>{children}</View>}
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
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
    marginBottom: 24,
  },
  topSection: {
    marginBottom: 32,
  },
  headerSection: {
    alignItems: "center",
  },
  mainImage: {
    width: 260,
    height: 260,
    marginBottom: 16,
    borderRadius: 10,
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "center",
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
  quickInfoSection: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 24,
  },
  gridSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 32,
  },
  gridColumn: {
    flex: 1,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  accordionTitle: {
    fontWeight: "700",
    fontSize: 18,
  },
  accordionBody: {
    paddingTop: 12,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 24,
  }
});