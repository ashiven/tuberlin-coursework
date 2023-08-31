Kompilieren und ausführen:
> javac HelloWorld.java 
> java HelloWorld 

Kompilieren und ausführen:
> javac HelloWorldEtAl.java
> java HelloWorldEtAl Groucho Harpo Chico

Die Klassen können natürlich auch in ein Projekt in IDEA kopiert werden. Um das Programm HelloWorldEtAl mit Argumenten auszuführen, legt man eine Configuration an, bzw. editiert diese.
Ein Weg dazu ist folgender:
Zunächst lässt man das Programm einmal mit Ctrl+Shift+F10 ohne Argumente laufen. Dadurch wird die Konfiguration 'HelloWorldEtAl' angelegt und oben rechts in IDEA angezeigt. Durch Klicken auf das Dreieck neben dem Name und auswählen von "Edit Configurations" bekommt man ein Fenster in dem viele Einstellung konfiguriert werden können. Dort trägt man die gewünschten Arguement unter 'Program arguments' ein, also z.B.
  Groucho Harpo Chico
Nach quittieren mit "OK" kann die Konfiguration mit Shift+F10 (oder Klicken auf das grüne Dreieck oben rechts neben dem Konfigurationsnamen) gestartet werden.

