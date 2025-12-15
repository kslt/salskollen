#!/bin/bash

UNDERLINE="\e[4m"
GREEN="\e[0;32m"
YELLOW="\e[0;33m"
RESET="\e[0m"

echo "=============================="
echo " Git uploader – lugn & enkel uppladdning av uppdateringar till GitHub 😄"
echo "=============================="
echo

if [ ! -d ".git" ]; then
  echo "❌ Detta är inte ett Git-repo."
  echo "   Gå till rätt mapp och försök igen."
  exit 1
fi

echo -e "${UNDERLINE}📊 Git status:${RESET}"
git status
echo "------------------------------"
echo

echo -e "${YELLOW}➡️  Vill du lägga till alla ändringar? (j/n): ${RESET}"
read ADD
if [[ "$ADD" =~ ^[Jj]$ ]]; then
  git add .
  echo "✅ Ändringar tillagda."
else
  echo "⏭️  Hoppar över git add."
fi
echo "------------------------------"
echo

echo -e "${YELLOW}➡️  Vill du skapa en commit? (j/n): ${RESET}"
read COMMIT
if [[ "$COMMIT" =~ ^[Jj]$ ]]; then
  read -p "📝 Commit-meddelande: " MESSAGE
  git commit -m "$MESSAGE"
else
  echo "⏭️  Ingen commit skapad."
fi
echo "------------------------------"
echo

echo -e "${YELLOW}➡️  Vill du pusha till GitHub nu? (j/n): ${RESET}"
read PUSH
if [[ "$PUSH" =~ ^[Jj]$ ]]; then
  git push
else
  echo "⏭️  Push hoppades över."
fi
echo "------------------------------"
echo

echo -e "${YELLOW}➡️  Vill du göra git pull (hämta senaste)? (j/n): ${RESET}"
read PULL
if [[ "$PULL" =~ ^[Jj]$ ]]; then
  git pull
else
  echo "⏭️  Ingen pull gjord."
fi
echo "------------------------------"
echo

echo -e "${GREEN}🎉 Klart! Git-status nu:${RESET}"
git status
echo