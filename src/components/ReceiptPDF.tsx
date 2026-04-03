import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    borderBottom: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 20,
  },
  logoSection: {
    flexDirection: "column",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  gymName: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  invoiceInfo: {
    textAlign: "right",
  },
  invoiceLabel: {
    fontSize: 20,
    color: "#111",
    fontWeight: "bold",
  },
  invoiceNumber: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
    color: "#444",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: "#666",
  },
  value: {
    fontSize: 12,
    color: "#111",
    fontWeight: "bold",
  },
  table: {
    marginTop: 20,
    borderTop: 1,
    borderTopColor: "#EEE",
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 10,
    borderTop: 2,
    borderTopColor: "#111",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTop: 1,
    borderTopColor: "#EEE",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 10,
    color: "#999",
  },
});

interface Props {
  payment: any;
  gym: any;
}

const ReceiptPDF = ({ payment, gym }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <Text style={styles.title}>BoxOS</Text>
          <Text style={styles.gymName}>{gym.name}</Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceLabel}>RECEIPT</Text>
          <Text style={styles.invoiceNumber}>{payment.invoiceNumber}</Text>
          <Text style={styles.label}>
            Date: {new Date(payment.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill To</Text>
        <Text style={styles.value}>{payment.userId.name}</Text>
        <Text style={styles.label}>{payment.userId.email}</Text>
      </View>

      <View style={[styles.section, styles.table]}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{payment.description}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{payment.method.toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{payment.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Paid</Text>
        <Text style={styles.totalValue}>
          ${(payment.amount / 100).toFixed(2)}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for being a part of {gym.name}!
        </Text>
        <Text style={styles.footerText}>
          Powered by BoxOS Gym Management
        </Text>
      </View>
    </Page>
  </Document>
);

export default ReceiptPDF;
