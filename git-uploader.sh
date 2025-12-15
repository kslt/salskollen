#!/bin/bash

echo "=============================="
echo " Git uploader – lugn & enkel uppladdning av uppdateringar till GitHub 😄"
echo "=============================="
echo

if [ ! -d ".git" ]; then
  echo "❌ Detta är inte ett Git-repo."
  echo "   Gå till rätt mapp och försök igen."
  exit 1
fi

echo "ℹ️  Git status:"
git status
echo "------------------------------"
echo

read -p "➡️  Vill du lägga till alla ändringar? (j/n): " ADD
if [[ "$ADD" =~ ^[Jj]$ ]]; then
  git add .
  echo "✅ Ändringar tillagda."
else
  echo "⏭️  Hoppar över git add."
fi
echo "------------------------------"
echo

read -p "➡️  Vill du skapa en commit? (j/n): " COMMIT
if [[ "$COMMIT" =~ ^[Jj]$ ]]; then
  read -p "📝 Commit-meddelande: " MESSAGE
  git commit -m "$MESSAGE"
else
  echo "⏭️  Ingen commit skapad."
fi
echo "------------------------------"
echo

read -p "➡️  Vill du pusha till GitHub nu? (j/n): " PUSH
if [[ "$PUSH" =~ ^[Jj]$ ]]; then
  git push
else
  echo "⏭️  Push hoppades över."
fi
echo "------------------------------"
echo

read -p "➡️  Vill du göra git pull (hämta senaste)? (j/n): " PULL
if [[ "$PULL" =~ ^[Jj]$ ]]; then
  git pull
else
  echo "⏭️  Ingen pull gjord."
fi
echo "------------------------------"
echo

echo "🎉 Klart! Git-status nu:"
git status
