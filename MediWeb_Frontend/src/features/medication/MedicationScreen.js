import React, { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, LayoutAnimation, UIManager, Platform, useWindowDimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";
import RenderHtml from "react-native-render-html";
import { useLocalSearchParams, Link } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { addToFavorites, addMedicationToProfile, getMedicationsForProfile, removeFromFavorites } from "features/profile/profile.api";
import { submitReview, updateReview } from "features/review/review.api";
import ReviewSection from "features/review/ReviewSection";
import { useMedicationService } from "./MedicationService";
import { styles } from "./MedicationScreen.style";
import { toast } from "utils/toast";
import Navbar from "components/Navbar";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MedicationDetailsScreen() {
  const { id: itemId } = useLocalSearchParams();
  const {
    data,
    reviews,
    averageRating,
    ratingDistribution,
    currentUser,
    isFavorite,
    favoriteId,
    profiles,
    loading,
    setIsFavorite,
    fetchReviews,
    setFavoriteId,
  } = useMedicationService(itemId);

  const [submitting, setSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState({
    baseInfo: false,
    substitutes: false,
    packages: false,
    sideEffects: false,
    application: false,
    fullLeaflet: false,
    finalSamples: false,
    defectiveForms: false,
  });

  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [profileHasMedication, setProfileHasMedication] = useState(false);

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  const { width: contentWidth } = useWindowDimensions();

  const renderHtmlSection = (html) =>
    html ? (
      <RenderHtml
        contentWidth={contentWidth - 64}
        source={{ html }}
        tagsStyles={{
          p: { marginVertical: 4, color: '#333' },
          ul: { marginLeft: 16 },
          li: { marginVertical: 2 },
        }}
      />
    ) : null;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <Navbar />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <Navbar />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Nem található adat.</Text>
        </View>
      </View>
    );
  }

  const docs = [
    { icon: "file-alt", label: "Betegtájékoztató", url: data.patientInfoUrl },
    { icon: "file-medical", label: "Alkalmazási előírás", url: data.smpcUrl },
    { icon: "file-signature", label: "Címkeszöveg", url: data.labelUrl },
  ].filter((d) => d.url);

  const handleCheckProfileMedication = async (profileId) => {
    try {
      const result = await getMedicationsForProfile(profileId, itemId);
      setProfileHasMedication(result?.some(m => m.itemId === parseInt(itemId)) ?? false);
    } catch (e) {
      console.error("Nem sikerült lekérni a profil gyógyszereit:", e);
      setProfileHasMedication(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <Navbar />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
      >
        <View style={styles.contentWrapper}>
          {/* Fejléc + kép + ikonok */}
          <View style={styles.topSection}>
            <View style={styles.headerSection}>
              <Text style={styles.title}>{data.name}</Text>
              <Text style={styles.subtitle}>
                Hatóanyag: {data.substance} • ATC: {data.atcCode}
              </Text>

              {data.active === false && (
                <View style={styles.inactiveBanner}>
                  <FontAwesome5 name="exclamation-triangle" size={18} color="#c62828" style={styles.inactiveBannerIcon} />
                  <Text style={styles.inactiveBannerText}>
                    A legutóbbi szinkron óta ez a készítmény inaktívnak jelölődött.
                  </Text>
                </View>
              )}

              <View style={styles.actionRow}>
                {/* Kedvencekhez adás gomb */}
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={async () => {
                    try {
                      if (isFavorite && favoriteId) {
                        await removeFromFavorites(favoriteId);
                        setIsFavorite(false);
                        setFavoriteId(null);
                        toast.success("Eltávolítva a kedvencek közül.");
                      } else {
                        const res = await addToFavorites(itemId);
                        setIsFavorite(true);
                        setFavoriteId(res.id);
                        toast.success("Hozzáadva a kedvencekhez.");
                      }
                    } catch (e) {
                      toast.error("Nem sikerült módosítani a kedvencek listát.");
                      console.error(e);
                    }
                  }}
                >
                  <FontAwesome5
                    name="heart"
                    size={20}
                    solid={isFavorite}
                    color={isFavorite ? "red" : "black"}
                  />
                  <Text style={styles.favoriteButtonText}>
                    {isFavorite ? "Kedvencben van" : "Kedvencekhez adás"}
                  </Text>
                </TouchableOpacity>

                {/* Profilhoz adás */}
                <View style={styles.profileSelectContainer}>
                  <Text style={styles.profileLabel}>Profilhoz adás:</Text>
                  <Picker
                    enabled={profiles.length > 0}
                    style={styles.profileSelect}
                    selectedValue={selectedProfileId || ""}
                    onValueChange={async (itemValue) => {
                      const id = itemValue ? Number(itemValue) : null;
                      setSelectedProfileId(id);
                      if (id) {
                        await handleCheckProfileMedication(id);
                      } else {
                        setProfileHasMedication(false);
                      }
                    }}
                  >
                    <Picker.Item label="Válassz profilt..." value="" />
                    {profiles.map((p) => (
                      <Picker.Item key={p.id} label={p.name} value={p.id} />
                    ))}
                  </Picker>

                  <TouchableOpacity
                    disabled={!selectedProfileId || profileHasMedication}
                    onPress={async () => {
                      try {
                        await addMedicationToProfile(selectedProfileId, itemId);
                        toast.success("Hozzáadva a profilhoz!");
                        setProfileHasMedication(true);
                        setSelectedProfileId(null);
                      } catch (err) {
                        toast.error("Hiba történt a profilhoz adáskor.");
                      }
                    }}
                  >
                    <Text style={styles.addButton}>Hozzáadás</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Kép */}
              {data.imageUrl && (
                <Image source={{ uri: data.imageUrl }} resizeMode="contain" style={styles.mainImage} />
              )}

              {/* Dokumentum ikonok */}
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

          {/* Accordion szekciók */}
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

          <Accordion title="Helyettesítő készítmények" isOpen={openSections.substitutes} onToggle={() => toggleSection("substitutes")}>
            {data.substitutes?.map((s, i) => (
              <Link key={i} href={`/medication/${s.itemId}`} style={{ color: '#2563eb', marginVertical: 4 }}>
                <Text>{s.name} ({s.registrationNumber})</Text>
              </Link>
            ))}
          </Accordion>

          <Accordion title="Kiszerelések" isOpen={openSections.packages} onToggle={() => toggleSection("packages")}>
            {data.packages?.map((p, i) => (
              <View key={i} style={{ marginVertical: 4 }}>
                <Text style={{ color: '#333' }}>{p.name} ({p.registrationNumber})</Text>
              </View>
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

          <ReviewSection
            reviews={reviews}
            averageRating={averageRating}
            ratingDistribution={ratingDistribution}
            submitting={submitting}
            isLoggedIn={!!currentUser}
            userId={currentUser?.id}
            onSubmit={async ({ rating, positive, negative }) => {
              if (!rating || !currentUser?.id) return;
              setSubmitting(true);
              try {
                await submitReview(itemId, { rating, positive, negative, userId: currentUser.id });
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
    </View>
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